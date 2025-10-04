export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'manager';
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLogin?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoute {
  _id: string;
  name: string;
  fromLocation: string;
  toLocation: string;
  pickupLocations: string[];
  distance: number;
  duration: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking {
  _id: string;
  userId: string | IUser;
  busId: string | IBus;
  routeId: string | IRoute;
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  seatNumbers: number[];
  travelDate: Date;
  pickupLocation?: string;
  bookingDate: Date;
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingRequest {
  busId: string;
  routeId: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  seatNumbers: number[];
  travelDate: string;
  totalAmount: number;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdateBookingRequest {
  passengerName?: string;
  passengerPhone?: string;
  passengerEmail?: string;
  seatNumbers?: number[];
  travelDate?: string;
  status?: 'confirmed' | 'cancelled' | 'completed';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  notes?: string;
}

export interface BookingFilters {
  routeId?: string;
  busId?: string;
  status?: string;
  paymentStatus?: string;
  travelDate?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface IBus {
  _id: string;
  busNumber: string;
  type: 'luxury' | 'semi_luxury' | 'normal';
  capacity: number;
  amenities: string[];
  departureTime: string;
  isActive: boolean;
  routeId?: string | IRoute;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRouteRequest {
  name: string;
  fromLocation: string;
  toLocation: string;
  price: number;
  pickupLocations: string[];
  distance: number;
  duration: number;
}

export interface UpdateRouteRequest {
  name?: string;
  fromLocation?: string;
  toLocation?: string;
  price: number;
  pickupLocations?: string[];
  distance?: number;
  duration?: number;
  isActive?: boolean;
}

export interface CreateBusRequest {
  busNumber: string;
  type: 'luxury' | 'semi_luxury' | 'normal';
  capacity: number;
  amenities: string[];
  departureTime: string;
  routeId: string;
}

export interface UpdateBusRequest {
  busNumber?: string;
  type?: 'luxury' | 'semi_luxury' | 'normal';
  capacity?: number;
  amenities?: string[];
  departureTime?: string;
  routeId?: string;
  isActive?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'admin' | 'manager';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'admin' | 'manager';
  isActive?: boolean;
  password?: string;
}

export interface TwoFactorSetupRequest {
  pin: string;
}

export interface PermissionMap {
  [key: string]: string[];
}

export const PERMISSIONS: PermissionMap = {
  super_admin: ['users:read', 'users:write', 'users:delete', 'routes:read', 'routes:write', 'routes:delete', 'buses:read', 'buses:write', 'buses:delete', 'bookings:read', 'bookings:write', 'bookings:delete', 'analytics:read'],
  admin: ['routes:read', 'routes:write', 'routes:delete', 'buses:read', 'buses:write', 'buses:delete', 'bookings:read', 'bookings:write', 'bookings:delete'],
  manager: ['bookings:read', 'bookings:write', 'bookings:delete']
};