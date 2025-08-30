import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
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

    await connectDB();

    const [
      totalUsers,
      totalAdmins,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalInquiries,
      newInquiries,
      recentBookings,
      recentInquiries
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'admin' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'new' }),
      Booking.find()
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(5),
      Inquiry.find()
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    return successResponse({
      stats: {
        totalUsers,
        totalAdmins,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalInquiries,
        newInquiries
      },
      recentActivity: {
        bookings: recentBookings,
        inquiries: recentInquiries
      }
    }, 'Dashboard stats retrieved successfully');

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return serverErrorResponse('Server error fetching dashboard stats');
  }
}