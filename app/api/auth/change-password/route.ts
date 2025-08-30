import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateUser } from '@/middleware/auth';
import { validatePassword } from '@/lib/validation';
import { successResponse, unauthorizedResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';
import { ChangePasswordRequest } from '@/types';

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    const body: ChangePasswordRequest = await request.json();
    const { currentPassword, newPassword } = body;

    // Validation
    const errors = [];
    if (!currentPassword) {
      errors.push({ field: 'currentPassword', message: 'Current password is required' });
    }
    if (!validatePassword(newPassword)) {
      errors.push({ field: 'newPassword', message: 'New password must be at least 6 characters long' });
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    await connectDB();
    const userWithPassword = await User.findById(user._id);
    
    if (!userWithPassword) {
      return unauthorizedResponse('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return errorResponse('Current password is incorrect');
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    return successResponse({}, 'Password updated successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return serverErrorResponse('Server error during password change');
  }
}