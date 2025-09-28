// app/api/bookings/available-seats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Bookings';
import Bus from '@/models/Bus';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!hasPermission(decoded.role, 'bookings:read')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Forbidden'
      }, { status: 403 });
    }

    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const busId = searchParams.get('busId');
    const travelDate = searchParams.get('travelDate');

    if (!busId || !travelDate) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Bus ID and travel date are required'
      }, { status: 400 });
    }

    // Get bus details
    const bus = await Bus.findById(busId);
    if (!bus) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Bus not found'
      }, { status: 404 });
    }

    // Get booked seats for the date
    const date = new Date(travelDate);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      busId,
      travelDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const bookedSeats = bookings.reduce((acc, booking) => {
      return [...acc, ...booking.seatNumbers];
    }, [] as number[]);

    const allSeats = Array.from({ length: bus.capacity }, (_, i) => i + 1);
    const availableSeats = allSeats.filter(seat => !bookedSeats.includes(seat));

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Available seats fetched successfully',
      data: {
        totalSeats: bus.capacity,
        bookedSeats,
        availableSeats,
        availableCount: availableSeats.length
      }
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error fetching available seats'
    }, { status: 500 });
  }
}