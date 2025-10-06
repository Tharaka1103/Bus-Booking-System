import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  name: string;
  mobile: string;
  feedback: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[0-9]{10,15}$/, 'Please enter a valid mobile number']
    },
    feedback: {
      type: String,
      required: [true, 'Feedback is required'],
      trim: true,
      minlength: [10, 'Feedback must be at least 10 characters'],
      maxlength: [1000, 'Feedback cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ isActive: 1, status: 1 });

const Feedback: Model<IFeedback> = 
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;