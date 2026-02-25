import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BatchDocument = Batch & Document;

@Schema()
export class Batch {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    maxlength: 50,
    minlength: 2,
    index: true,
  })
  batchName: string;

  @Prop({
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  })
  status: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const BatchSchema = SchemaFactory.createForClass(Batch);
