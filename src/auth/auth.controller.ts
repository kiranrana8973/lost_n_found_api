import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { StudentsService } from '../students/students.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('refresh')
  @Public()
  @Throttle({ default: { ttl: 15 * 60 * 1000, limit: 5 } })
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Headers('authorization') authorization?: string,
  ) {
    let rawRefreshToken = dto.refreshToken;

    if (!rawRefreshToken && authorization?.startsWith('Bearer')) {
      rawRefreshToken = authorization.split(' ')[1];
    }

    if (!rawRefreshToken) {
      throw new BadRequestException('Please provide a refresh token');
    }

    return this.studentsService.refreshAccessToken(rawRefreshToken);
  }
}
