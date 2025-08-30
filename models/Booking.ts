import mongoose, { Schema } from 'mongoose';
import { IBooking } from '@/types';

const bookingSchema = new Schema<IBooking>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  from: {
    type: String,
    required: [true, 'Origin is required']
  },
  to: {
    type: String,
    required: [true, 'Destination is required']
  },
  departureDate: {
    type: Date,
    required: [true, 'Departure date is required']
  },
  departureTime: {
    type: String,
    required: [true, 'Departure time is required']
  },
  passengers: {
    type: Number,
    required: [true, 'Number of passengers is required'],
    min: 1,
    max: 10
  },
  seatNumbers: [{
    type: String
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  bookingReference: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'VT' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;