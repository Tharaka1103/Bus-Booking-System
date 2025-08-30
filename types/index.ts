import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'admin';
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IBooking extends Document {
  _id: string;
  user: string | IUser;
  from: string;
  to: string;
  departureDate: Date;
  departureTime: string;
  passengers: number;
  seatNumbers: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  bookingReference: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInquiry extends Document {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string | IUser;
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest {
  user?: IUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalInquiries: number;
  newInquiries: number;
}

export interface UserDashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: string;
  priority?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}