import validator from 'validator';

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 50;
};

export interface ValidationError {
  field: string;
  message: string;
}

export const validateRegisterData = (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateName(data.firstName)) {
    errors.push({ field: 'firstName', message: 'First name must be 1-50 characters' });
  }

  if (!validateName(data.lastName)) {
    errors.push({ field: 'lastName', message: 'Last name must be 1-50 characters' });
  }

  if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }


  if (!validatePassword(data.password)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  return errors;
};

export const validateLoginData = (data: {
  email: string;
  password: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};