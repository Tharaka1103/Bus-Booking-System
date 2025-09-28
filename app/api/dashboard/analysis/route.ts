// app/api/dashboard/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Bookings';
import Bus from '@/models/Bus';
import Route from '@/models/Route';
import User from '@/models/User';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!hasPermission(decoded.role, 'analytics:read')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Forbidden'
      }, { status: 403 });
    }

    await connectToDatabase();

    // Get current date for filtering
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Fetch statistics
    const [
      totalUsers,
      totalBuses,
      totalRoutes,
      monthlyBookings
    ] = await Promise.all([
      User.countDocuments({}),
      Bus.countDocuments({ isActive: true }),
      Route.countDocuments({ isActive: true }),
      Booking.find({
        bookingDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $ne: 'cancelled' }
      })
    ]);

    // Calculate monthly revenue
    const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    // Get booking stats by status
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get bookings by route
    const bookingsByRoute = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$routeId',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          passengers: { $sum: { $size: '$seatNumbers' } }
        }
      },
      {
        $lookup: {
          from: 'routes',
          localField: '_id',
          foreignField: '_id',
          as: 'route'
        }
      },
      {
        $unwind: '$route'
      },
      {
        $project: {
          routeName: '$route.name',
          bookings: 1,
          revenue: 1,
          passengers: 1
        }
      },
      {
        $sort: { bookings: -1 }
      }
    ]);

    // Get daily bookings for the month (for line chart)
    const dailyBookings = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$bookingDate' },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Dashboard analytics fetched successfully',
      data: {
        totalUsers,
        totalBuses,
        totalRoutes,
        revenue: monthlyRevenue,
        bookingStats,
        bookingsByRoute,
        dailyBookings,
        monthlyBookings: monthlyBookings.length
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error fetching dashboard analytics'
    }, { status: 500 });
  }
}