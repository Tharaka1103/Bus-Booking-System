import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { authenticateUser, checkRole } from '@/middleware/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    if (!checkRole(['user'])(user)) {
      return forbiddenResponse('Access denied. User role required.');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    let query: any = { user: user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    await connectDB();

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query)
    ]);

    return successResponse({
      bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }, 'User bookings retrieved successfully');

  } catch (error) {
    console.error('Get user bookings error:', error);
    return serverErrorResponse('Server error fetching bookings');
  }
}