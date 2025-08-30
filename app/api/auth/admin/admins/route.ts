import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateUser, checkRole } from '@/middleware/auth';
import { validateRegisterData } from '@/lib/validation';
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';
import { PaginationQuery, RegisterRequest } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    if (!checkRole(['admin'])(user)) {
      return forbiddenResponse('Access denied. Admin role required.');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await connectDB();

    const [admins, total] = await Promise.all([
      User.find({ role: 'admin' })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: 'admin' })
    ]);

    return successResponse({
      admins,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }, 'Admins retrieved successfully');

  } catch (error) {
    console.error('Get admins error:', error);
    return serverErrorResponse('Server error fetching admins');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    if (!checkRole(['admin'])(user)) {
      return forbiddenResponse('Access denied. Admin role required.');
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

    // Create new admin
    const admin = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      phone,
      password,
      role: 'admin'
    });

    await admin.save();

    return successResponse({
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        isActive: admin.isActive
      }
    }, 'Admin created successfully', 201);

  } catch (error) {
    console.error('Create admin error:', error);
    return serverErrorResponse('Server error creating admin');
  }
}