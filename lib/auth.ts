import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};