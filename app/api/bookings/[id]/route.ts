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
    const { id } = await params; // Await the params here
    
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
    const { id } = await params; // Await the params here
    
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

    const booking = await Booking.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
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
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
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
    const { id } = await params; // Await the params here
    
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