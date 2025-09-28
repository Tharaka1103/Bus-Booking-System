import { ValidationError } from '@/types';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function validateTwoFactorCode(code: string): boolean {
  return /^[0-9]{6}$/.test(code);
}

export function validateUserData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!data.firstName || data.firstName.length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  }

  if (!data.lastName || data.lastName.length < 2) {
    errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
  }

  if (!data.phone || !validatePhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Valid phone number is required' });
  }

  if (data.password && !validatePassword(data.password)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (data.role && !['admin', 'manager'].includes(data.role)) {
    errors.push({ field: 'role', message: 'Role must be admin or manager' });
  }

  return errors;
}