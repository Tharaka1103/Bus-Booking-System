// app/api/buses/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Bus from '@/models/Bus';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse, CreateBusRequest } from '@/types';

// GET all buses
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
    if (!hasPermission(decoded.role, 'buses:read')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Forbidden'
      }, { status: 403 });
    }

    await connectToDatabase();
    const buses = await Bus.find().populate('routeId').sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Buses fetched successfully',
      data: buses
    });
  } catch (error) {
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
                  request.headers.get('authorization')?.replace('Bearer ', '');    if (!token) {
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
    await connectToDatabase();

    const bus = await Bus.create(body);
    const populatedBus = await Bus.findById(bus._id).populate('routeId');

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Bus created successfully',
      data: populatedBus
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Bus number already exists'
      }, { status: 400 });
    }
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error creating bus'
    }, { status: 500 });
  }
}