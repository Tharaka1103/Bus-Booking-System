// models/Route.ts (update the existing file)

import mongoose, { Schema, model } from 'mongoose';
import { IRoute } from '@/types';

const routeSchema = new Schema<IRoute>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  fromLocation: {
    type: String,
    required: true,
    trim: true
  },
  toLocation: {
    type: String,
    required: true,
    trim: true
  },
  pickupLocations: [{
    type: String,
    trim: true
  }],
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Route || model<IRoute>('Route', routeSchema);