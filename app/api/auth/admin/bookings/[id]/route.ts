import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { authenticateUser, checkRole } from '@/middleware/auth';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, validationErrorResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    if (!checkRole(['admin'])(user)) {
      return forbiddenResponse('Access denied. Admin role required.');
    }

    // Get ID from URL search params
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return validationErrorResponse([{ field: 'id', message: 'Booking ID is required' }]);
    }

    const body = await request.json();
    const { status, notes } = body;

    // Validation
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return validationErrorResponse([{ field: 'status', message: 'Invalid status' }]);
    }

    await connectDB();

    const booking = await Booking.findById(bookingId).populate('user', 'firstName lastName email');
    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    // Update booking
    booking.status = status;
    if (notes) booking.notes = notes;
    booking.updatedBy = user._id;
    booking.updatedAt = new Date();

    await booking.save();

    return successResponse({ booking }, 'Booking status updated successfully');

  } catch (error) {
    console.error('Update booking status error:', error);
    return serverErrorResponse('Server error updating booking status');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    if (!checkRole(['admin'])(user)) {
      return forbiddenResponse('Access denied. Admin role required.');
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    await connectDB();

    if (bookingId) {
      // Get specific booking
      const booking = await Booking.findById(bookingId)
        .populate('user', 'firstName lastName email phone')
        .populate('route', 'from to duration price');
      
      if (!booking) {
        return notFoundResponse('Booking not found');
      }
      
      return successResponse({ booking }, 'Booking retrieved successfully');
    } else {
      // Get all bookings with filtering
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const status = searchParams.get('status');
      const search = searchParams.get('search') || '';
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      
      const skip = (page - 1) * limit;
      
      const query: any = {};
      
      if (status) {
        query.status = status;
      }
      
      if (dateFrom || dateTo) {
        query.travelDate = {};
        if (dateFrom) query.travelDate.$gte = new Date(dateFrom);
        if (dateTo) query.travelDate.$lte = new Date(dateTo);
      }

      const [bookings, total] = await Promise.all([
        Booking.find(query)
          .populate('user', 'firstName lastName email')
          .populate('route', 'from to')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Booking.countDocuments(query)
      ]);

      return successResponse({
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, 'Bookings retrieved successfully');
    }

  } catch (error) {
    console.error('Get booking error:', error);
    return serverErrorResponse('Server error retrieving booking');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    if (!checkRole(['admin'])(user)) {
      return forbiddenResponse('Access denied. Admin role required.');
    }

    // Get ID from URL search params
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return validationErrorResponse([{ field: 'id', message: 'Booking ID is required' }]);
    }

    await connectDB();

    const booking = await Booking.findByIdAndDelete(bookingId);
    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    return successResponse({}, 'Booking deleted successfully');

  } catch (error) {
    console.error('Delete booking error:', error);
    return serverErrorResponse('Server error deleting booking');
  }
}