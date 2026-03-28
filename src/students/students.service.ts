import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Student, StudentDocument } from './schemas/student.schema';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { BatchesService } from '../batches/batches.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
    private batchesService: BatchesService,
    private configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  async create(dto: CreateStudentDto) {
    await this.batchesService.findById(dto.batchId);

    const existingEmail = await this.studentModel.findOne({ email: dto.email });
    if (existingEmail) throw new BadRequestException('Email already exists');

    const existingUsername = await this.studentModel
      .findOne({ username: dto.username })
      .collation({ locale: 'en', strength: 2 });
    if (existingUsername) throw new BadRequestException('Username already exists');

    const student = await this.studentModel.create({
      ...dto,
      profilePicture: dto.profilePicture || 'default-profile.png',
    });

    const studentResponse = student.toObject() as unknown as Record<string, unknown>;
    delete studentResponse.password;

    return studentResponse;
  }

  async login(dto: LoginStudentDto) {
    const student = await this.studentModel
      .findOne({ email: dto.email })
      .select('+password');

    if (!student || !(await (student as any).matchPassword(dto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = (student as any).getSignedJwtToken();
    const rawRefreshToken = this.generateRefreshToken();
    const hashedRefreshToken = this.hashToken(rawRefreshToken);

    const refreshExpireDays = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRE_DAYS',
      7,
    );
    await this.refreshTokenModel.create({
      token: hashedRefreshToken,
      student: student._id,
      expiresAt: new Date(
        Date.now() + refreshExpireDays * 24 * 60 * 60 * 1000,
      ),
    });

    const userResponse = student.toObject() as unknown as Record<string, unknown>;
    delete userResponse.password;

    return {
      success: true,
      token: accessToken,
      refreshToken: rawRefreshToken,
      data: userResponse,
    };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      const hashedToken = this.hashToken(refreshToken);
      await this.refreshTokenModel.deleteOne({ token: hashedToken });
    }
  }

  async findAll() {
    return this.studentModel.find().populate('batchId', 'batchName');
  }

  async findById(id: string) {
    const student = await this.studentModel
      .findById(id)
      .populate('batchId', 'batchName');
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(id: string, dto: UpdateStudentDto, currentUserId: string) {
    const student = await this.studentModel.findById(id);
    if (!student) throw new NotFoundException('Student not found');

    if (student._id.toString() !== currentUserId) {
      throw new ForbiddenException('Not authorized to update this student profile');
    }

    const isPasswordChange = !!dto.password;

    if (dto.name) student.name = dto.name;
    if (dto.email) student.email = dto.email;
    if (dto.username) student.username = dto.username;
    if (dto.phoneNumber) student.phoneNumber = dto.phoneNumber;
    if (dto.batchId) student.batchId = dto.batchId as any;
    if (dto.profilePicture) student.profilePicture = dto.profilePicture;
    if (dto.password) student.password = dto.password;

    await student.save();

    // Invalidate all refresh tokens when password changes
    if (isPasswordChange) {
      await this.refreshTokenModel.deleteMany({ student: student._id });
    }

    return student;
  }

  async delete(id: string, currentUserId: string) {
    const student = await this.studentModel.findById(id);
    if (!student) throw new NotFoundException('Student not found');

    if (student._id.toString() !== currentUserId) {
      throw new ForbiddenException('Not authorized to delete this student profile');
    }

    if (
      student.profilePicture &&
      student.profilePicture !== 'default-profile.png'
    ) {
      const profilePicturePath = path.join(
        process.cwd(),
        'public/profile_pictures',
        student.profilePicture,
      );
      if (fs.existsSync(profilePicturePath)) {
        fs.unlinkSync(profilePicturePath);
      }
    }

    await this.studentModel.findByIdAndDelete(id);
  }

  async refreshAccessToken(rawRefreshToken: string) {
    const hashedToken = this.hashToken(rawRefreshToken);
    const storedToken = await this.refreshTokenModel.findOne({
      token: hashedToken,
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenModel.deleteOne({ _id: storedToken._id });
      throw new UnauthorizedException('Refresh token has expired');
    }

    await this.refreshTokenModel.deleteOne({ _id: storedToken._id });

    const student = await this.studentModel.findById(storedToken.student);
    if (!student) throw new UnauthorizedException('User not found');

    const newAccessToken = (student as any).getSignedJwtToken();
    const newRawRefreshToken = this.generateRefreshToken();
    const newHashedRefreshToken = this.hashToken(newRawRefreshToken);

    const refreshExpireDays = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRE_DAYS',
      7,
    );
    await this.refreshTokenModel.create({
      token: newHashedRefreshToken,
      student: student._id,
      expiresAt: new Date(
        Date.now() + refreshExpireDays * 24 * 60 * 60 * 1000,
      ),
    });

    const userResponse = student.toObject() as unknown as Record<string, unknown>;
    delete userResponse.password;

    return {
      success: true,
      token: newAccessToken,
      refreshToken: newRawRefreshToken,
      data: userResponse,
    };
  }
}
