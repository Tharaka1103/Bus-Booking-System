// app/api/dashboard/bus-seats/[busId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Bus from '@/models/Bus';
import Booking from '@/models/Bookings';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse } from '@/types';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ busId: string }> }
) {
  try {
    const { busId } = await params;
    
    console.log('=== BUS SEATS DEBUG START ===');
    console.log('Bus ID:', busId);
    
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

    // Get date from query params or use today
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    
    // Fix date handling - use UTC to avoid timezone issues
    let targetDateStr: string;
    if (dateParam) {
      targetDateStr = dateParam;
    } else {
      // Get today's date in YYYY-MM-DD format in user's timezone
      const now = new Date();
      targetDateStr = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0');
    }
    
    // Create proper UTC dates for database query
    const targetDate = new Date(targetDateStr + 'T00:00:00.000Z');
    const nextDay = new Date(targetDateStr + 'T23:59:59.999Z');
    
    console.log('Date param:', dateParam);
    console.log('Target date string:', targetDateStr);
    console.log('Target date (start):', targetDate);
    console.log('Target date (end):', nextDay);

    // Find the bus
    const bus = await Bus.findById(busId).populate('routeId');
    if (!bus) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Bus not found'
      }, { status: 404 });
    }
    
    console.log('Found bus:', {
      id: bus._id,
      busNumber: bus.busNumber,
      capacity: bus.capacity
    });

    // Convert busId to ObjectId for proper comparison
    const busObjectId = new mongoose.Types.ObjectId(busId);

    // First, let's see what dates we actually have in the database
    const allBookingsForBus = await Booking.find({ busId: busObjectId }).select('travelDate status seatNumbers');
    console.log('All bookings for this bus:', allBookingsForBus.map(b => ({
      id: b._id,
      travelDate: b.travelDate,
      status: b.status,
      seatNumbers: b.seatNumbers
    })));

    // Try a more flexible date query
    const bookings = await Booking.find({
      busId: busObjectId,
      travelDate: {
        $gte: targetDate,
        $lte: nextDay
      },
      status: { $ne: 'cancelled' }
    }).populate('userId', 'firstName lastName email phone');

    console.log('Bookings found with flexible date range:', bookings.length);

    // If no bookings found, try matching just the date part (ignore time)
    if (bookings.length === 0) {
      console.log('No bookings found, trying date-only match...');
      
      // Alternative approach: use date aggregation to match just the date part
      const bookingsAlt = await Booking.aggregate([
        {
          $match: {
            busId: busObjectId,
            status: { $ne: 'cancelled' }
          }
        },
        {
          $addFields: {
            dateOnly: {
              $dateToString: { format: "%Y-%m-%d", date: "$travelDate" }
            }
          }
        },
        {
          $match: {
            dateOnly: targetDateStr
          }
        }
      ]);

      console.log('Alternative booking search results:', bookingsAlt.length);
      
      if (bookingsAlt.length > 0) {
        // Convert back to proper booking documents
        const bookingIds = bookingsAlt.map(b => b._id);
        const finalBookings = await Booking.find({
          _id: { $in: bookingIds }
        }).populate('userId', 'firstName lastName email phone');
        
        console.log('Final bookings from alternative search:', finalBookings.length);
        // Use these bookings instead
        bookings.splice(0, bookings.length, ...finalBookings);
      }
    }

    console.log('Final bookings count:', bookings.length);
    if (bookings.length > 0) {
      console.log('Sample booking details:', {
        id: bookings[0]._id,
        travelDate: bookings[0].travelDate,
        status: bookings[0].status,
        seatNumbers: bookings[0].seatNumbers
      });
    }

    // Calculate booked seats
    const bookedSeats = bookings.reduce((acc, booking) => {
      console.log('Processing booking seat numbers:', booking.seatNumbers);
      return [...acc as any, ...booking.seatNumbers];
    }, [] as number[]);

    console.log('Final booked seats:', bookedSeats);
    console.log('Booked seats count:', bookedSeats.length);

    // Create seat map
    const seatMap = Array.from({ length: bus.capacity }, (_, i) => ({
      seatNumber: i + 1,
      isBooked: bookedSeats.includes(i + 1),
      booking: bookings.find(b => b.seatNumbers.includes(i + 1))
    }));

    // Weekly booking trend - use the same flexible date approach
    const weekStart = new Date(targetDate);
    weekStart.setDate(weekStart.getDate() - 6);

    const weeklyTrend = await Booking.aggregate([
      {
        $match: {
          busId: busObjectId,
          travelDate: { $gte: weekStart, $lte: nextDay },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $addFields: {
          dateOnly: {
            $dateToString: { format: "%Y-%m-%d", date: "$travelDate" }
          }
        }
      },
      {
        $group: {
          _id: "$dateOnly",
          bookings: { $sum: { $size: '$seatNumbers' } }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing days in weekly trend
    const trendMap = new Map(weeklyTrend.map(item => [item._id, item.bookings]));
    const fullWeeklyTrend = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(targetDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      fullWeeklyTrend.push({
        _id: dateStr,
        bookings: trendMap.get(dateStr) || 0
      });
    }

    const totalBookedSeats = bookedSeats.length;
    const totalAvailableSeats = bus.capacity - totalBookedSeats;
    const occupancyRate = bus.capacity > 0 
      ? ((totalBookedSeats / bus.capacity) * 100).toFixed(1)
      : '0';

    console.log('=== FINAL CALCULATION ===');
    console.log('Total seats:', bus.capacity);
    console.log('Booked seats:', totalBookedSeats);
    console.log('Available seats:', totalAvailableSeats);
    console.log('Occupancy rate:', occupancyRate);
    console.log('=== BUS SEATS DEBUG END ===');

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Bus seat details fetched successfully',
      data: {
        bus: {
          _id: bus._id,
          busNumber: bus.busNumber,
          type: bus.type,
          capacity: bus.capacity,
          routeId: bus.routeId
        },
        date: targetDateStr,
        totalSeats: bus.capacity,
        bookedSeats: totalBookedSeats,
        availableSeats: totalAvailableSeats,
        occupancyRate,
        seatMap,
        bookings,
        weeklyTrend: fullWeeklyTrend
      }
    });
  } catch (error) {
    console.error('Bus seats error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error fetching bus seat details'
    }, { status: 500 });
  }
}