import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { profilePictureMulterOptions } from '../uploads/multer-config.factory';
import { ConfigService } from '@nestjs/config';

@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @Public()
  async create(@Body() dto: CreateStudentDto) {
    const student = await this.studentsService.create(dto);
    return { success: true, data: student };
  }

  @Post('login')
  @Public()
  @Throttle({ default: { ttl: 15 * 60 * 1000, limit: 5 } })
  async login(
    @Body() dto: LoginStudentDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.studentsService.login(dto);

    const cookieExpire = this.configService.get<number>('JWT_COOKIE_EXPIRE', 1);
    res.cookie('token', result.token, {
      expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
    });

    return result;
  }

  @Post('logout')
  @Public()
  async logout(
    @Body('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.studentsService.logout(refreshToken);
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    return { success: true, message: 'Logged out successfully' };
  }

  @Post('upload')
  @Public()
  @UseInterceptors(FileInterceptor('profilePicture', profilePictureMulterOptions))
  async uploadProfilePicture(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Please upload a file');
    return { success: true, data: file.filename };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    const student = await this.studentsService.findById(user._id.toString());
    return { success: true, data: student };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const students = await this.studentsService.findAll();
    return { success: true, count: students.length, data: students };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const student = await this.studentsService.findById(id);
    return { success: true, data: student };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateStudentDto,
    @CurrentUser() user: any,
  ) {
    const student = await this.studentsService.update(
      id,
      dto,
      user._id.toString(),
    );
    return { success: true, data: student };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: any,
  ) {
    await this.studentsService.delete(id, user._id.toString());
    return { success: true, message: 'Student deleted successfully' };
  }
}
