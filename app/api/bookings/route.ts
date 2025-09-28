// app/api/bookings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Bookings';
import Bus from '@/models/Bus';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse, CreateBookingRequest, BookingFilters } from '@/types';

// GET all bookings with filters
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');    if (!token) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters: BookingFilters = {};

    if (searchParams.get('routeId')) filters.routeId = searchParams.get('routeId')!;
    if (searchParams.get('busId')) filters.busId = searchParams.get('busId')!;
    if (searchParams.get('status')) filters.status = searchParams.get('status')!;
    if (searchParams.get('paymentStatus')) filters.paymentStatus = searchParams.get('paymentStatus')!;
    if (searchParams.get('travelDate')) {
      const date = new Date(searchParams.get('travelDate')!);
      filters.travelDate = date.toISOString();
    }

    // Build query
    const query: any = {};
    if (filters.routeId) query.routeId = filters.routeId;
    if (filters.busId) query.busId = filters.busId;
    if (filters.status) query.status = filters.status;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
    if (filters.travelDate) {
      const startOfDay = new Date(filters.travelDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.travelDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.travelDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'firstName lastName email phone')
      .populate('busId', 'busNumber type capacity')
      .populate('routeId', 'name fromLocation toLocation price')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Bookings fetched successfully',
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error fetching bookings'
    }, { status: 500 });
  }
}

// POST create booking
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!hasPermission(decoded.role, 'bookings:write')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Forbidden'
      }, { status: 403 });
    }

    const body: CreateBookingRequest = await request.json();
    await connectToDatabase();

    // Check if seats are available
    const travelDate = new Date(body.travelDate);
    const startOfDay = new Date(travelDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(travelDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      busId: body.busId,
      travelDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const bookedSeats = existingBookings.reduce((acc, booking) => {
      return [...acc, ...booking.seatNumbers];
    }, [] as number[]);

    const conflictingSeats = body.seatNumbers.filter(seat => bookedSeats.includes(seat));
    if (conflictingSeats.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: `Seats ${conflictingSeats.join(', ')} are already booked`
      }, { status: 400 });
    }

    // Get bus capacity
    const bus = await Bus.findById(body.busId);
    if (!bus) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Bus not found'
      }, { status: 404 });
    }

    // Validate seat numbers
    const invalidSeats = body.seatNumbers.filter(seat => seat < 1 || seat > bus.capacity);
    if (invalidSeats.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: `Invalid seat numbers: ${invalidSeats.join(', ')}`
      }, { status: 400 });
    }

    // Create booking
    const booking = await Booking.create({
      ...body,
      userId: decoded.userId,
      bookingDate: new Date()
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'firstName lastName email phone')
      .populate('busId', 'busNumber type capacity')
      .populate('routeId', 'name fromLocation toLocation price');

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error creating booking'
    }, { status: 500 });
  }
}