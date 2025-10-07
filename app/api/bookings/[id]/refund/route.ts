// app/api/bookings/[id]/refund/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Bookings';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function POST(
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
        message: 'Forbidden - Admin access required'
      }, { status: 403 });
    }

    await connectToDatabase();
    
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }

    // Check if booking is already refunded
    if (booking.paymentStatus === 'refunded') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Booking is already refunded'
      }, { status: 400 });
    }

    // Check if booking payment status is paid
    if (booking.paymentStatus !== 'paid') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Only paid bookings can be refunded'
      }, { status: 400 });
    }

    // Check if booking is within 7-day refund period
    const bookingDate = new Date(booking.bookingDate);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference > 7) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Refund period of 7 days has expired'
      }, { status: 400 });
    }

    // Check if booking is completed
    if (booking.status === 'completed') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Completed bookings cannot be refunded'
      }, { status: 400 });
    }

    // Process refund
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { 
        paymentStatus: 'refunded',
        status: 'cancelled',
        notes: booking.notes 
          ? `${booking.notes}\n\nRefunded on ${new Date().toISOString()}`
          : `Refunded on ${new Date().toISOString()}`
      },
      { new: true }
    )
      .populate('userId', 'firstName lastName email phone')
      .populate('busId', 'busNumber type capacity')
      .populate('routeId', 'name fromLocation toLocation price');

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Booking refunded successfully. Amount will be processed within 7 business days.',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error processing refund'
    }, { status: 500 });
  }
}