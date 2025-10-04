import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Bus from '@/models/Bus';
import { ApiResponse } from '@/types';

// GET buses for public booking (no authentication required)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get('routeId');
    const travelDate = searchParams.get('travelDate');

    let query: any = { isActive: true };
    
    if (routeId) {
      query.routeId = routeId;
    }

    const buses = await Bus.find(query)
      .populate('routeId')
      .sort({ departureTime: 1 }); // Sort by departure time

    // Filter buses based on departure time if travelDate is today
    let availableBuses = buses;
    
    if (travelDate) {
      const selectedDate = new Date(travelDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      // If travel date is today, filter out buses departing in less than 30 minutes
      if (selectedDate.getTime() === today.getTime()) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

        availableBuses = buses.map(bus => {
          const [hours, minutes] = bus.departureTime.split(':').map(Number);
          const departureTimeInMinutes = hours * 60 + minutes;
          const timeDifference = departureTimeInMinutes - currentTime;

          return {
            ...bus.toObject(),
            isLocked: timeDifference < 30 && timeDifference >= 0,
            timeToDeparture: timeDifference
          };
        });
      } else {
        // For future dates, no buses are locked
        availableBuses = buses.map(bus => ({
          ...bus.toObject(),
          isLocked: false,
          timeToDeparture: null
        }));
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Buses fetched successfully',
      data: availableBuses
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error fetching buses'
    }, { status: 500 });
  }
}