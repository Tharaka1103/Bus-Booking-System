import mongoose, { Schema, model } from 'mongoose';
import { IBus } from '@/types';

const busSchema = new Schema<IBus>({
  busNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['luxury', 'semi_luxury', 'normal'],
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  amenities: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  routeId: {
    type: Schema.Types.ObjectId,
    ref: 'Route'
  }
}, {
  timestamps: true
});

export default mongoose.models.Bus || model<IBus>('Bus', busSchema);