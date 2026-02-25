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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { QueryItemsDto } from './dto/query-items.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import {
  itemPhotoMulterOptions,
  itemVideoMulterOptions,
} from '../uploads/multer-config.factory';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('itemPhoto', itemPhotoMulterOptions))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Please upload a photo file');
    return {
      success: true,
      data: `item_photos/${file.filename}`,
      message: 'Item photo uploaded successfully',
    };
  }

  @Post('upload-video')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('itemVideo', itemVideoMulterOptions))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Please upload a video file');
    return {
      success: true,
      data: `item_videos/${file.filename}`,
      message: 'Item video uploaded successfully',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateItemDto) {
    const item = await this.itemsService.create(dto);
    return { success: true, data: item };
  }

  @Get()
  @Public()
  async findAll(@Query() query: QueryItemsDto) {
    return this.itemsService.findAll(query);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const item = await this.itemsService.findById(id);
    return { success: true, data: item };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateItemDto,
    @CurrentUser() user: any,
  ) {
    const item = await this.itemsService.update(id, dto, user._id.toString());
    return { success: true, data: item };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: any,
  ) {
    await this.itemsService.delete(id, user._id.toString());
    return { success: true, message: 'Item deleted successfully' };
  }
}
