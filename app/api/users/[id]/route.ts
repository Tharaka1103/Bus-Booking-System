import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, hasPermission } from '@/lib/auth';
import { validateUserData } from '@/lib/validation';
import { ApiResponse, UpdateUserRequest } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const user = await User.findById(id).select('-password -twoFactorSecret');
    
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body: UpdateUserRequest = await request.json();
    
    // Validate update data
    const validationErrors = validateUserData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Prevent super admin modification by non-super admins
    if (user.role === 'super_admin' && decoded.role !== 'super_admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Cannot modify super admin user'
      }, { status: 403 });
    }

    // Update user
    Object.assign(user, body);
    await user.save();

    // Return updated user data
    const updatedUser = await User.findById(id).select('-password -twoFactorSecret');

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    
    if (!hasPermission(decoded.role, 'users:delete')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Prevent super admin deletion
    if (user.role === 'super_admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Cannot delete super admin user'
      }, { status: 403 });
    }

    // Prevent self-deletion
    if (user._id.toString() === decoded.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Cannot delete your own account'
      }, { status: 403 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}