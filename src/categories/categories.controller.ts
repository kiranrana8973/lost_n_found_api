import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.create(dto);
    return { success: true, data: category };
  }

  @Get()
  @Public()
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return { success: true, count: categories.length, data: categories };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const category = await this.categoriesService.findById(id);
    return { success: true, data: category };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, dto);
    return { success: true, data: category };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.categoriesService.delete(id);
    return { success: true, message: 'Category deleted successfully' };
  }
}
