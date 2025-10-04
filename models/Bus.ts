import mongoose, { Schema, model } from 'mongoose';
import { IBus } from '@/types';

const busSchema = new Schema<IBus>({
  busNumber: {
    type: String,
    required: [true, 'Bus number is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['luxury', 'semi_luxury', 'normal'],
    required: [true, 'Bus type is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [100, 'Capacity cannot exceed 100']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  departureTime: {
    type: String,
    required: [true, 'Departure time is required'],
    default: '08:00',
    validate: {
      validator: function(v: string) {
        if (!v) return false;
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Departure time must be in HH:MM format (e.g., 08:00)'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  routeId: {
    type: Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  }
}, {
  timestamps: true
});

// Add indexes
busSchema.index({ departureTime: 1 });
busSchema.index({ routeId: 1 });
busSchema.index({ busNumber: 1 });

export default mongoose.models.Bus || model<IBus>('Bus', busSchema);