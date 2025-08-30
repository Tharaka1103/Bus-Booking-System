import { NextRequest } from 'next/server';
import { authenticateUser } from '@/middleware/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return unauthorizedResponse(error || 'Authentication failed');
    }

    return successResponse({ user }, 'User data retrieved successfully');
  } catch (error) {
    console.error('Get user error:', error);
    return serverErrorResponse('Server error');
  }
}