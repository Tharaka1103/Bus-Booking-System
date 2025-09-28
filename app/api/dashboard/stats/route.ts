import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Bus from '@/models/Bus';
import Route from '@/models/Route';
import Booking from '../../../../models/booking';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!hasPermission(decoded.role, 'users:read')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    // Get stats
    const totalUsers = await User.countDocuments();
    const totalBuses = await Bus.countDocuments();
    const totalRoutes = await Route.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'confirmed' });
    
    // Calculate revenue (mock data for now)
    const revenue = 150000; // This would come from actual booking amounts

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Dashboard stats retrieved',
      data: {
        totalUsers,
        totalBuses,
        totalRoutes,
        totalBookings,
        activeBookings,
        revenue
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}