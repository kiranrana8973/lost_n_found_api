import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export type StudentDocument = Student & Document;

@Schema({ timestamps: false })
export class Student {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false,
  })
  password: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Batch', required: true })
  batchId: Types.ObjectId;

  @Prop({ default: 'default-profile.png', trim: true })
  profilePicture: string;

  @Prop({ default: 'student', enum: ['student', 'admin'] })
  role: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

StudentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

StudentSchema.methods.getSignedJwtToken = function (): string {
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
};

StudentSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};
