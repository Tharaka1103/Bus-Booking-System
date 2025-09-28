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
  seatNumbers: [{
    type: Number,
    required: true
  }],
  travelDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
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
  }
}, {
  timestamps: true
});

export default mongoose.models.Booking || model<IBooking>('Booking', bookingSchema);