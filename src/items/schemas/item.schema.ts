import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: [true, 'Item name is required'], trim: true })
  itemName: string;

  @Prop({ required: [true, 'Description is required'], trim: true })
  description: string;

  @Prop({
    required: [true, 'Item type is required'],
    type: String,
    enum: ['lost', 'found'],
  })
  type: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  })
  category: Types.ObjectId;

  @Prop({
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters'],
  })
  location: string;

  @Prop({ required: [true, 'Media is required'], trim: true })
  media: string;

  @Prop({ type: String, enum: ['photo', 'video'], default: 'photo' })
  mediaType: string;

  @Prop({ type: Types.ObjectId, ref: 'Student', default: null })
  claimedBy: Types.ObjectId;

  @Prop({ default: false })
  isClaimed: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'Student',
    required: [true, 'Reported by is required'],
  })
  reportedBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['available', 'claimed', 'resolved'],
    default: 'available',
  })
  status: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
