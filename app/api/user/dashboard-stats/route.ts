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

    await connectDB();

    const userId = user._id;
    
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      recentBookings
    ] = await Promise.all([
      Booking.countDocuments({ user: userId }),
      Booking.countDocuments({ user: userId, status: 'pending' }),
      Booking.countDocuments({ user: userId, status: 'confirmed' }),
      Booking.countDocuments({ user: userId, status: 'completed' }),
      Booking.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    return successResponse({
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings
      },
      recentBookings
    }, 'User dashboard stats retrieved successfully');

  } catch (error) {
    console.error('User dashboard stats error:', error);
    return serverErrorResponse('Server error fetching dashboard stats');
  }
}