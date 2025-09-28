// models/Booking.ts (update the existing file)

import mongoose, { Schema, model } from 'mongoose';
import { IBooking } from '@/types';

const bookingSchema = new Schema<IBooking>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  busId: {
    type: Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  routeId: {
    type: Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  passengerName: {
    type: String,
    required: true,
    trim: true
  },
  passengerPhone: {
    type: String,
    required: true,
    trim: true
  },
  passengerEmail: {
    type: String,
    trim: true
  },
  seatNumbers: [{
    type: Number,
    required: true
  }],
  travelDate: {
    type: Date,
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  pickupLocation: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'bank_transfer'],
    default: 'cash'
  },
  transactionId: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
bookingSchema.index({ travelDate: 1, busId: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.models.Booking || model<IBooking>('Booking', bookingSchema);