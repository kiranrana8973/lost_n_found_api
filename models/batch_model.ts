import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBatch extends Document {
  batchName: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

const batchSchema = new Schema<IBatch>({
  batchName: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Batch name cannot exceed 50 characters'],
    minlength: [2, 'Batch name must be at least 2 characters'],
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Batch: Model<IBatch> = mongoose.model<IBatch>('Batch', batchSchema);

export default Batch;
