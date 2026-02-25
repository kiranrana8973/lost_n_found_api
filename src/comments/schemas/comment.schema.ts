import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: [true, 'Comment text is required'], trim: true })
  text: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item reference is required'],
  })
  item: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Student',
    required: [true, 'Commenter reference is required'],
  })
  commentedBy: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: 'Student' }])
  mentionedUsers: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentComment: Types.ObjectId | null;

  @Prop({ default: false })
  isReply: boolean;

  @Prop([{ type: Types.ObjectId, ref: 'Student' }])
  likes: Types.ObjectId[];

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({ type: Date, default: null })
  editedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true,
});

CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

CommentSchema.index({ item: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });
CommentSchema.index({ commentedBy: 1 });
