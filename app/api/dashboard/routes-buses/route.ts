// app/api/dashboard/routes-buses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Route from '@/models/Route';
import Bus from '@/models/Bus';
import Booking from '@/models/Bookings';
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

    // Get all active routes
    const routes = await Route.find({ isActive: true }).lean();

    // Get buses for each route with booking stats
    const routesWithBuses = await Promise.all(
      routes.map(async (route) => {
        // Find all buses for this route
        const buses = await Bus.find({ 
          routeId: route._id, 
          isActive: true 
        }).lean();
        
        // Get booking stats for each bus
        const busesWithStats = await Promise.all(
          buses.map(async (bus) => {
            // Get today's date range
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Find bookings for today
            const bookings = await Booking.find({
              busId: bus._id,
              travelDate: { $gte: today, $lt: tomorrow },
              status: { $ne: 'cancelled' }
            });

            // Calculate booked seats
            const bookedSeats = bookings.reduce((acc, booking) => {
              return acc + booking.seatNumbers.length;
            }, 0);

            const availableSeats = bus.capacity - bookedSeats;
            const occupancyRate = bus.capacity > 0 
              ? ((bookedSeats / bus.capacity) * 100).toFixed(1)
              : '0';

            return {
              _id: bus._id,
              busNumber: bus.busNumber,
              type: bus.type,
              capacity: bus.capacity,
              amenities: bus.amenities,
              bookedSeats,
              availableSeats,
              occupancyRate
            };
          })
        );

        return {
          _id: route._id,
          name: route.name,
          fromLocation: route.fromLocation,
          toLocation: route.toLocation,
          price: route.price,
          distance: route.distance,
          duration: route.duration,
          buses: busesWithStats
        };
      })
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Routes and buses fetched successfully',
      data: routesWithBuses
    });
  } catch (error) {
    console.error('Routes buses error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error fetching routes and buses'
    }, { status: 500 });
  }
}