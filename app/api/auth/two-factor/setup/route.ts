import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { validateTwoFactorCode } from '@/lib/validation';
import { ApiResponse, TwoFactorSetupRequest } from '@/types';

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
    const body: TwoFactorSetupRequest = await request.json();
    const { pin } = body;

    if (!validateTwoFactorCode(pin)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'PIN must be exactly 6 digits'
      }, { status: 400 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Hash and store the PIN
    const hashedPin = await user.hashTwoFactorSecret(pin);
    user.twoFactorSecret = hashedPin;
    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });

  } catch (error) {
    console.error('Two-factor setup error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}