import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateBatchDto) {
    const batch = await this.batchesService.create(dto);
    return { success: true, data: batch };
  }

  @Get()
  @Public()
  async findAll() {
    const batches = await this.batchesService.findAll();
    return { success: true, count: batches.length, data: batches };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const batch = await this.batchesService.findById(id);
    return { success: true, data: batch };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateBatchDto,
  ) {
    const batch = await this.batchesService.update(id, dto);
    return { success: true, data: batch };
  }
}
