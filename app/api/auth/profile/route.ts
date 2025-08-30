import { NextRequest } from 'next/server';
import { authenticateUser } from '@/middleware/auth';
import { validateName, } from '@/lib/validation';
import { successResponse, unauthorizedResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse';
import { UpdateProfileRequest } from '@/types';

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    const body: UpdateProfileRequest = await request.json();
    const { firstName, lastName, phone, avatar } = body;

    // Validation
    const errors = [];
    if (firstName && !validateName(firstName)) {
      errors.push({ field: 'firstName', message: 'First name must be 1-50 characters' });
    }
    if (lastName && !validateName(lastName)) {
      errors.push({ field: 'lastName', message: 'Last name must be 1-50 characters' });
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    // Update user
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return successResponse({ user }, 'Profile updated successfully');

  } catch (error) {
    console.error('Update profile error:', error);
    return serverErrorResponse('Server error during profile update');
  }
}