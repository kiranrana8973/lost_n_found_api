import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IItem extends Document {
  _id: Types.ObjectId;
  itemName: string;
  description: string;
  type: 'lost' | 'found';
  category: Types.ObjectId;
  location: string;
  media: string;
  mediaType: 'photo' | 'video';
  claimedBy: Types.ObjectId | null;
  isClaimed: boolean;
  reportedBy: Types.ObjectId;
  status: 'available' | 'claimed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Item type is required'],
      enum: ['lost', 'found'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    media: {
      type: String,
      required: [true, 'Media is required'],
      trim: true,
    },
    mediaType: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo',
    },
    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    isClaimed: {
      type: Boolean,
      default: false,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Reported by is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['available', 'claimed', 'resolved'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

const Item: Model<IItem> = mongoose.model<IItem>('Item', itemSchema);

export default Item;
