import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { validateLoginData } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';
import { rateLimit } from '@/middleware/rateLimiter';
import { LoginRequest } from '@/types';

const limiter = rateLimit(15 * 60 * 1000, 10); // 10 requests per 15 minutes

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = limiter(request);
    if (!rateLimitResult.allowed) {
      return errorResponse('Too many login attempts. Please try again later.', 429);
    }

    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validation
    const validationErrors = validateLoginData({ email, password });
    if (validationErrors.length > 0) {
      return validationErrorResponse(validationErrors);
    }

    await connectDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse('Account has been disabled. Please contact support.');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    return successResponse({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return serverErrorResponse('Server error during login');
  }
}