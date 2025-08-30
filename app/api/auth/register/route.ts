import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { validateRegisterData } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';
import { rateLimit } from '@/middleware/rateLimiter';
import { RegisterRequest } from '@/types';

const limiter = rateLimit(15 * 60 * 1000, 5); // 5 requests per 15 minutes

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = limiter(request);
    if (!rateLimitResult.allowed) {
      return errorResponse('Too many registration attempts. Please try again later.', 429);
    }

    const body: RegisterRequest = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    // Validation
    const validationErrors = validateRegisterData({ firstName, lastName, email, phone, password });
    if (validationErrors.length > 0) {
      return validationErrorResponse(validationErrors);
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse('User already exists with this email');
    }

    // Create new user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      phone,
      password
    });

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
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Registration error:', error);
    return serverErrorResponse('Server error during registration');
  }
}