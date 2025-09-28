// app/api/public/bookings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Bookings';
import Bus from '@/models/Bus';
import Route from '@/models/Route';
import { ApiResponse } from '@/types';

// POST create public booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectToDatabase();

    // Validate required fields (including pickupLocation)
    if (!body.busId || !body.routeId || !body.passengerName || !body.passengerPhone || 
        !body.seatNumbers || !body.travelDate || !body.pickupLocation) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Missing required fields. Please provide all required information including pickup location.'
      }, { status: 400 });
    }

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

    const conflictingSeats = body.seatNumbers.filter((seat: number) => bookedSeats.includes(seat));
    if (conflictingSeats.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: `Seats ${conflictingSeats.join(', ')} are already booked`
      }, { status: 400 });
    }

    // Get bus and route details
    const [bus, route] = await Promise.all([
      Bus.findById(body.busId),
      Route.findById(body.routeId)
    ]);

    if (!bus || !route) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid bus or route'
      }, { status: 404 });
    }

    // Validate seat numbers
    const invalidSeats = body.seatNumbers.filter((seat: number) => seat < 1 || seat > bus.capacity);
    if (invalidSeats.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: `Invalid seat numbers: ${invalidSeats.join(', ')}`
      }, { status: 400 });
    }

    // Validate pickup location
    const validPickupLocations = [route.fromLocation, ...route.pickupLocations];
    if (!validPickupLocations.includes(body.pickupLocation)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: `Invalid pickup location. Please select from available pickup points.`
      }, { status: 400 });
    }

    // Calculate total amount
    const totalAmount = route.price * body.seatNumbers.length;

    // Create booking with all required fields including pickupLocation
    const booking = await Booking.create({
      userId: '000000000000000000000000', // Dummy user ID for public bookings
      busId: body.busId,
      routeId: body.routeId,
      passengerName: body.passengerName,
      passengerPhone: body.passengerPhone,
      passengerEmail: body.passengerEmail || '',
      pickupLocation: body.pickupLocation, // Include pickup location
      seatNumbers: body.seatNumbers,
      travelDate: body.travelDate,
      totalAmount,
      bookingDate: new Date(),
      status: 'confirmed',
      paymentStatus: 'pending',
      paymentMethod: body.paymentMethod || 'cash',
      notes: body.notes || ''
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('busId', 'busNumber type capacity')
      .populate('routeId', 'name fromLocation toLocation price pickupLocations');

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