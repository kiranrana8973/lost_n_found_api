import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  token: string;
  student: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true,
    index: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RefreshToken: Model<IRefreshToken> = mongoose.model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema
);

export default RefreshToken;
