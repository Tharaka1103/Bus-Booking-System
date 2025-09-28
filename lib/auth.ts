import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IUser } from '@/types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'];

export function generateToken(user: IUser): string {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error('Invalid token');
  }
}


export function hasPermission(userRole: string, permission: string): boolean {
  const rolePermissions = {
    super_admin: [
      'users:read',
      'users:write',
      'users:delete',
      'routes:read',
      'routes:write',
      'routes:delete',
      'buses:read',
      'buses:write',
      'buses:delete',
      'bookings:read',
      'bookings:write',
      'bookings:delete',
    ],
    admin: [
      'routes:read',
      'routes:write',
      'routes:delete',
      'buses:read',
      'buses:write',
      'buses:delete',
      'bookings:read',
      'bookings:write',
      'bookings:delete',
    ],
    manager: ['bookings:read', 'bookings:write', 'bookings:delete'],
  };

  const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || [];
  return permissions.includes(permission);
}
