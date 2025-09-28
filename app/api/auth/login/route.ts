import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { validateEmail, validateTwoFactorCode } from '@/lib/validation';
import { ApiResponse, LoginRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body: LoginRequest = await request.json();
    const { email, password, twoFactorCode } = body;

    console.log('🔐 Login attempt:', { 
      email, 
      hasTwoFactorCode: !!twoFactorCode,
      twoFactorCodeLength: twoFactorCode?.length || 0
    });

    // Validate input
    if (!email || !validateEmail(email)) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Valid email is required'
      }, { status: 400 });
    }

    if (!password) {
      console.log('❌ Missing password');
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Password is required'
      }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email }).select('+twoFactorSecret');
    if (!user || !user.isActive) {
      console.log('❌ User not found or inactive:', { email, userExists: !!user, isActive: user?.isActive });
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    console.log('👤 User found:', { 
      email: user.email, 
      role: user.role, 
      twoFactorEnabled: user.twoFactorEnabled,
      isActive: user.isActive 
    });

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    console.log('✅ Password verified for user:', email);

    // Check two-factor authentication
    if (user.twoFactorEnabled) {
      console.log('🔒 User has 2FA enabled');
      
      if (!twoFactorCode) {
        console.log('📱 2FA code required but not provided');
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Two-factor authentication code required',
          data: { requiresTwoFactor: true }
        }, { status: 200 }); // Status 200 to indicate this is expected behavior
      }

      console.log('🔢 Validating 2FA code:', { 
        providedCode: twoFactorCode,
        codeLength: twoFactorCode.length 
      });

      if (!validateTwoFactorCode(twoFactorCode)) {
        console.log('❌ Invalid 2FA code format');
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Two-factor code must be 6 digits',
          data: { requiresTwoFactor: true }
        }, { status: 400 });
      }

      const isTwoFactorValid = await user.compareTwoFactorSecret(twoFactorCode);
      if (!isTwoFactorValid) {
        console.log('❌ Invalid 2FA code provided');
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Invalid two-factor authentication code',
          data: { requiresTwoFactor: true }
        }, { status: 401 });
      }

      console.log('✅ 2FA code verified successfully');
    } else {
      console.log('🔓 User does not have 2FA enabled');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    console.log('💾 Updated last login for user:', email);

    // Generate token
    const token = generateToken(user);
    console.log('🎫 Generated JWT token for user:', email);

    // Prepare user data (exclude sensitive fields)
    const userData = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Login successful',
      data: { token, user: userData }
    });

    // Set HTTP-only cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    console.log('🎉 Login completed successfully for user:', email);
    return response;

  } catch (error) {
    console.error('💥 Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}