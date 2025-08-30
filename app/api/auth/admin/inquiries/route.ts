import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import { authenticateUser, checkRole } from '@/middleware/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/apiResponse';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const skip = (page - 1) * limit;

    let query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    await connectDB();

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .populate('assignedTo', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Inquiry.countDocuments(query)
    ]);

    return successResponse({
      inquiries,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }, 'Inquiries retrieved successfully');

  } catch (error) {
    console.error('Get inquiries error:', error);
    return serverErrorResponse('Server error fetching inquiries');
  }
}