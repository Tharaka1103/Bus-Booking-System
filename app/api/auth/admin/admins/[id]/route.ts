import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateUser, checkRole } from '@/middleware/auth';
import { validateName } from '@/lib/validation';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, validationErrorResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

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
    const adminId = searchParams.get('id');

    if (!adminId) {
      return validationErrorResponse([{ field: 'id', message: 'Admin ID is required' }]);
    }

    const body = await request.json();
    const { firstName, lastName, phone, isActive } = body;

    // Validation
    const errors = [];
    if (firstName && !validateName(firstName)) {
      errors.push({ field: 'firstName', message: 'First name must be 1-50 characters' });
    }
    if (lastName && !validateName(lastName)) {
      errors.push({ field: 'lastName', message: 'Last name must be 1-50 characters' });
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    await connectDB();

    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
      return notFoundResponse('Admin not found');
    }

    // Update admin
    if (firstName) admin.firstName = firstName.trim();
    if (lastName) admin.lastName = lastName.trim();
    if (phone) admin.phone = phone;
    if (typeof isActive === 'boolean') admin.isActive = isActive;

    await admin.save();

    return successResponse({ admin }, 'Admin updated successfully');

  } catch (error) {
    console.error('Update admin error:', error);
    return serverErrorResponse('Server error updating admin');
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
    const adminId = searchParams.get('id');

    if (!adminId) {
      return validationErrorResponse([{ field: 'id', message: 'Admin ID is required' }]);
    }

    // Prevent self-deletion
    if (adminId === user._id.toString()) {
      return errorResponse('Cannot delete your own account');
    }

    await connectDB();

    const admin = await User.findOneAndDelete({ _id: adminId, role: 'admin' });
    if (!admin) {
      return notFoundResponse('Admin not found');
    }

    return successResponse({}, 'Admin deleted successfully');

  } catch (error) {
    console.error('Delete admin error:', error);
    return serverErrorResponse('Server error deleting admin');
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
    const adminId = searchParams.get('id');

    await connectDB();

    if (adminId) {
      // Get specific admin
      const admin = await User.findOne({ _id: adminId, role: 'admin' }).select('-password');
      if (!admin) {
        return notFoundResponse('Admin not found');
      }
      return successResponse({ admin }, 'Admin retrieved successfully');
    } else {
      // Get all admins
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';
      
      const skip = (page - 1) * limit;
      
      const query: any = { role: 'admin' };
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const [admins, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(query)
      ]);

      return successResponse({
        admins,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, 'Admins retrieved successfully');
    }

  } catch (error) {
    console.error('Get admin error:', error);
    return serverErrorResponse('Server error retrieving admin');
  }
}