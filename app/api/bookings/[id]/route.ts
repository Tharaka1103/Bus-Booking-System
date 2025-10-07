// app/api/bookings/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Bookings';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse, UpdateBookingRequest } from '@/types';

// GET single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
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
    const booking = await Booking.findById(id)
      .populate('userId', 'firstName lastName email phone')
      .populate('busId', 'busNumber type capacity')
      .populate('routeId', 'name fromLocation toLocation price');

    if (!booking) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Booking fetched successfully',
      data: booking
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error fetching booking'
    }, { status: 500 });
  }
}

// PUT update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
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

    const body: UpdateBookingRequest = await request.json();
    await connectToDatabase();

    // Get existing booking
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }

    // Check if booking is within 7-day modification period
    const bookingDate = new Date(existingBooking.bookingDate);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference > 7 && existingBooking.status !== 'cancelled') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Booking can only be modified within 7 days of booking date'
      }, { status: 400 });
    }

    // If travel date is being changed, check seat availability
    if (body.travelDate || body.seatNumbers) {
      const travelDate = body.travelDate ? new Date(body.travelDate) : existingBooking.travelDate;
      const seatNumbers = body.seatNumbers || existingBooking.seatNumbers;
      
      const startOfDay = new Date(travelDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(travelDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Check for conflicting bookings (excluding current booking)
      const conflictingBookings = await Booking.find({
        _id: { $ne: id },
        busId: existingBooking.busId,
        travelDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' },
        seatNumbers: { $in: seatNumbers }
      });

      if (conflictingBookings.length > 0) {
        const bookedSeats = conflictingBookings.reduce((acc, booking) => {
          return [...acc, ...booking.seatNumbers];
        }, [] as number[]);
        
        return NextResponse.json<ApiResponse>({
          success: false,
          message: `Some seats are already booked: ${bookedSeats.join(', ')}`
        }, { status: 400 });
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email phone')
      .populate('busId', 'busNumber type capacity')
      .populate('routeId', 'name fromLocation toLocation price');

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error updating booking'
    }, { status: 500 });
  }
}

// DELETE booking (soft delete by changing status)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!hasPermission(decoded.role, 'bookings:delete')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Forbidden'
      }, { status: 403 });
    }

    await connectToDatabase();
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error cancelling booking'
    }, { status: 500 });
  }
}