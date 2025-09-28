// app/api/routes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Route from '@/models/Route';
import { verifyToken, hasPermission } from '@/lib/auth';
import { ApiResponse, CreateRouteRequest, UpdateRouteRequest } from '@/types';

// GET all routes
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
    if (!hasPermission(decoded.role, 'routes:read')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Forbidden'
      }, { status: 403 });
    }

    await connectToDatabase();
    const routes = await Route.find().sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Routes fetched successfully',
      data: routes
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error fetching routes'
    }, { status: 500 });
  }
}

// POST create route
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
    if (!hasPermission(decoded.role, 'routes:write')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Forbidden'
      }, { status: 403 });
    }

    const body: CreateRouteRequest = await request.json();
    await connectToDatabase();

    const route = await Route.create(body);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Route created successfully',
      data: route
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Error creating route'
    }, { status: 500 });
  }
}