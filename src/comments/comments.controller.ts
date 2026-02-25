import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ToggleLikeDto } from './dto/toggle-like.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateCommentDto) {
    const comment = await this.commentsService.create(dto);
    return { success: true, data: comment };
  }

  @Get('item/:itemId')
  @Public()
  async getByItem(
    @Param('itemId', ParseObjectIdPipe) itemId: string,
    @Query('includeReplies') includeReplies: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.commentsService.getByItem(
      itemId,
      includeReplies,
      query.page,
      query.limit,
    );
  }

  @Get('student/:studentId')
  @Public()
  async getByStudent(
    @Param('studentId', ParseObjectIdPipe) studentId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.commentsService.getByStudent(
      studentId,
      query.page,
      query.limit,
    );
  }

  @Get('mentions/:studentId')
  @Public()
  async getMentions(
    @Param('studentId', ParseObjectIdPipe) studentId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.commentsService.getMentions(
      studentId,
      query.page,
      query.limit,
    );
  }

  @Get(':commentId/replies')
  @Public()
  async getReplies(
    @Param('commentId', ParseObjectIdPipe) commentId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.commentsService.getReplies(
      commentId,
      query.page,
      query.limit,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: any,
  ) {
    const comment = await this.commentsService.update(
      id,
      dto,
      user._id.toString(),
    );
    return { success: true, data: comment };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: any,
  ) {
    await this.commentsService.delete(id, user._id.toString());
    return { success: true, message: 'Comment deleted successfully' };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: ToggleLikeDto,
  ) {
    return this.commentsService.toggleLike(id, dto.studentId);
  }
}
