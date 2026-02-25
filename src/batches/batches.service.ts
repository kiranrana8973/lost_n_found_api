import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Batch, BatchDocument } from './schemas/batch.schema';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Injectable()
export class BatchesService {
  constructor(@InjectModel(Batch.name) private batchModel: Model<BatchDocument>) {}

  async create(dto: CreateBatchDto) {
    return this.batchModel.create(dto);
  }

  async findAll() {
    return this.batchModel.find();
  }

  async findById(id: string) {
    const batch = await this.batchModel.findById(id);
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async update(id: string, dto: UpdateBatchDto) {
    const batch = await this.batchModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }
}
