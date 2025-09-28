// app/api/buses/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Bus from '@/models/Bus';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse, UpdateBusRequest } from '@/types';

// GET single bus
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const bus = await Bus.findById(params.id).populate('routeId');

    if (!bus) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Bus not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Bus fetched successfully',
      data: bus
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error fetching bus'
    }, { status: 500 });
  }
}

// PUT update bus
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body: UpdateBusRequest = await request.json();
    await connectToDatabase();

    const bus = await Bus.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('routeId');

    if (!bus) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Bus not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Bus updated successfully',
      data: bus
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Bus number already exists'
      }, { status: 400 });
    }
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error updating bus'
    }, { status: 500 });
  }
}

// DELETE bus
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!hasPermission(decoded.role, 'buses:delete')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Forbidden'
      }, { status: 403 });
    }

    await connectToDatabase();
    const bus = await Bus.findByIdAndDelete(params.id);

    if (!bus) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Bus not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error deleting bus'
    }, { status: 500 });
  }
}