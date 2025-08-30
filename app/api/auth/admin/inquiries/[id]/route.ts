import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import User from '@/models/User';
import { authenticateUser, checkRole } from '@/middleware/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, validationErrorResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    if (!checkRole(['admin'])(user)) {
      return forbiddenResponse('Access denied. Admin role required.');
    }

    // Get ID from URL search params
    const { searchParams } = new URL(request.url);
    const inquiryId = searchParams.get('id');

    if (!inquiryId) {
      return validationErrorResponse([{ field: 'id', message: 'Inquiry ID is required' }]);
    }

    const body = await request.json();
    const { status, priority, response, assignedTo } = body;

    // Validation
    const errors = [];
    const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];

    if (status && !validStatuses.includes(status)) {
      errors.push({ field: 'status', message: 'Invalid status' });
    }
    if (priority && !validPriorities.includes(priority)) {
      errors.push({ field: 'priority', message: 'Invalid priority' });
    }
    if (assignedTo) {
      // Validate if assignedTo user exists and is admin
      const assignedAdmin = await User.findOne({ _id: assignedTo, role: 'admin' });
      if (!assignedAdmin) {
        errors.push({ field: 'assignedTo', message: 'Invalid admin user' });
      }
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    await connectDB();

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return notFoundResponse('Inquiry not found');
    }

    // Update inquiry
    if (status) inquiry.status = status;
    if (priority) inquiry.priority = priority;
    if (response) {
      inquiry.response = response;
      inquiry.respondedAt = new Date();
      inquiry.respondedBy = user._id;
    }
    if (assignedTo) inquiry.assignedTo = assignedTo;
    
    inquiry.updatedAt = new Date();

    await inquiry.save();
    await inquiry.populate([
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'respondedBy', select: 'firstName lastName' },
      { path: 'user', select: 'firstName lastName email' }
    ]);

    return successResponse({ inquiry }, 'Inquiry updated successfully');

  } catch (error) {
    console.error('Update inquiry error:', error);
    return serverErrorResponse('Server error updating inquiry');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    if (!checkRole(['admin'])(user)) {
      return forbiddenResponse('Access denied. Admin role required.');
    }

    const { searchParams } = new URL(request.url);
    const inquiryId = searchParams.get('id');

    await connectDB();

    if (inquiryId) {
      // Get specific inquiry
      const inquiry = await Inquiry.findById(inquiryId)
        .populate('user', 'firstName lastName email phone')
        .populate('assignedTo', 'firstName lastName email')
        .populate('respondedBy', 'firstName lastName');
      
      if (!inquiry) {
        return notFoundResponse('Inquiry not found');
      }
      
      return successResponse({ inquiry }, 'Inquiry retrieved successfully');
    } else {
      // Get all inquiries with filtering
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const status = searchParams.get('status');
      const priority = searchParams.get('priority');
      const assignedTo = searchParams.get('assignedTo');
      const search = searchParams.get('search') || '';
      
      const skip = (page - 1) * limit;
      
      const query: any = {};
      
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (assignedTo) query.assignedTo = assignedTo;
      
      if (search) {
        query.$or = [
          { subject: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }

      const [inquiries, total] = await Promise.all([
        Inquiry.find(query)
          .populate('user', 'firstName lastName email')
          .populate('assignedTo', 'firstName lastName')
          .sort({ priority: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Inquiry.countDocuments(query)
      ]);

      return successResponse({
        inquiries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, 'Inquiries retrieved successfully');
    }

  } catch (error) {
    console.error('Get inquiry error:', error);
    return serverErrorResponse('Server error retrieving inquiry');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    if (!checkRole(['admin'])(user)) {
      return forbiddenResponse('Access denied. Admin role required.');
    }

    // Get ID from URL search params
    const { searchParams } = new URL(request.url);
    const inquiryId = searchParams.get('id');

    if (!inquiryId) {
      return validationErrorResponse([{ field: 'id', message: 'Inquiry ID is required' }]);
    }

    await connectDB();

    const inquiry = await Inquiry.findByIdAndDelete(inquiryId);
    if (!inquiry) {
      return notFoundResponse('Inquiry not found');
    }

    return successResponse({}, 'Inquiry deleted successfully');

  } catch (error) {
    console.error('Delete inquiry error:', error);
    return serverErrorResponse('Server error deleting inquiry');
  }
}