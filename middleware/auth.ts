import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { IUser } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: IUser;
}

export async function authenticateUser(request: NextRequest): Promise<{ user: IUser | null; error: string | null }> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'Access denied. No token provided.' };
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = verifyToken(token);
      
      await connectDB();
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return { user: null, error: 'Invalid token or user account disabled.' };
      }

      return { user, error: null };
    } catch (tokenError) {
      if (tokenError instanceof Error) {
        if (tokenError.name === 'JsonWebTokenError') {
          return { user: null, error: 'Invalid token.' };
        }
        if (tokenError.name === 'TokenExpiredError') {
          return { user: null, error: 'Token expired.' };
        }
      }
      return { user: null, error: 'Authentication failed.' };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Server error during authentication.' };
  }
}

export function checkRole(requiredRoles: string[]) {
  return (user: IUser): boolean => {
    return requiredRoles.includes(user.role);
  };
}