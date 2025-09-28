import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, hasPermission } from '@/lib/auth';
import { validateUserData } from '@/lib/validation';
import { ApiResponse, CreateUserRequest } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!hasPermission(decoded.role, 'users:read')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    const users = await User.find()
      .select('-password -twoFactorSecret')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Users retrieved successfully',
      data: { users }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.cookies.get('authToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!hasPermission(decoded.role, 'users:write')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    const body: CreateUserRequest = await request.json();
    const validationErrors = validateUserData({ ...body, password: body.password });

    if (validationErrors.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User with this email already exists'
      }, { status: 400 });
    }

    // Create new user
    const newUser = new User({
      ...body,
      createdBy: decoded.userId
    });

    await newUser.save();

    // Return user data without sensitive fields
    const userData = {
      _id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User created successfully',
      data: { user: userData }
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}