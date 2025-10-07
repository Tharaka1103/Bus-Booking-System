import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Bus from '@/models/Bus';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse, CreateBusRequest } from '@/types';

// GET all buses
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

    await connectToDatabase();
    const buses = await Bus.find().populate('routeId', 'name fromLocation toLocation').sort({ departureTime: 1, createdAt: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Buses fetched successfully',
      data: buses
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error fetching buses'
    }, { status: 500 });
  }
}

// POST create bus
export async function POST(request: NextRequest) {
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
    if (!hasPermission(decoded.role, 'buses:write')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Forbidden'
      }, { status: 403 });
    }

    const body: CreateBusRequest = await request.json();
    
    console.log('📥 Received bus creation request:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.busNumber || !body.busNumber.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Bus number is required'
      }, { status: 400 });
    }

    if (!body.departureTime) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Departure time is required'
      }, { status: 400 });
    }

    if (!body.routeId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Route is required'
      }, { status: 400 });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(body.departureTime)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid departure time format. Use HH:MM format (e.g., 08:00 or 14:30)'
      }, { status: 400 });
    }

    await connectToDatabase();

    // Create bus with explicit data structure
    const busData = {
      busNumber: body.busNumber.trim(),
      type: body.type,
      capacity: Number(body.capacity),
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      departureTime: body.departureTime,
      routeId: body.routeId,
      isActive: true
    };

    console.log('💾 Creating bus with data:', JSON.stringify(busData, null, 2));

    const bus = await Bus.create(busData);
    
    console.log('✅ Bus created successfully:', {
      id: bus._id,
      busNumber: bus.busNumber,
      departureTime: bus.departureTime
    });
    
    const populatedBus = await Bus.findById(bus._id).populate('routeId');

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Bus created successfully',
      data: populatedBus
    }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating bus:', error);
    
    if (error.code === 11000) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Bus number already exists'
      }, { status: 400 });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');
      return NextResponse.json<ApiResponse>({
        success: false,
        message: `Validation error: ${messages}`
      }, { status: 400 });
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error creating bus: ' + error.message
    }, { status: 500 });
  }
}