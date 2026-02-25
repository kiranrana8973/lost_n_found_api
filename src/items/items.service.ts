import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Item, ItemDocument } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { QueryItemsDto } from './dto/query-items.dto';
import { paginatedResponse } from '../common/utils/pagination.util';

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private itemModel: Model<ItemDocument>) {}

  async create(dto: CreateItemDto) {
    return this.itemModel.create(dto);
  }

  async findAll(query: QueryItemsDto) {
    const { page = 1, limit = 10, type, status, category } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, string> = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const total = await this.itemModel.countDocuments(filter);
    const items = await this.itemModel
      .find(filter)
      .populate('reportedBy', 'name username')
      .populate('claimedBy', 'name username')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return paginatedResponse(items, total, page, limit);
  }

  async findById(id: string) {
    const item = await this.itemModel
      .findById(id)
      .populate('reportedBy', 'name username')
      .populate('claimedBy', 'name username')
      .populate('category', 'name');
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(id: string, dto: UpdateItemDto, currentUserId: string) {
    const item = await this.itemModel.findById(id);
    if (!item) throw new NotFoundException('Item not found');

    if (item.reportedBy.toString() !== currentUserId) {
      throw new ForbiddenException('Not authorized to update this item');
    }

    if (dto.itemName) item.itemName = dto.itemName;
    if (dto.description) item.description = dto.description;
    if (dto.type) item.type = dto.type;
    if (dto.category) item.category = dto.category as any;
    if (dto.location) item.location = dto.location;
    if (dto.media) item.media = dto.media;
    if (dto.claimedBy) item.claimedBy = dto.claimedBy as any;
    if (dto.isClaimed !== undefined) item.isClaimed = dto.isClaimed;
    if (dto.status) item.status = dto.status;

    await item.save();
    return item;
  }

  async delete(id: string, currentUserId: string) {
    const item = await this.itemModel.findById(id);
    if (!item) throw new NotFoundException('Item not found');

    if (item.reportedBy.toString() !== currentUserId) {
      throw new ForbiddenException('Not authorized to delete this item');
    }

    if (item.media && item.media !== 'default.jpg') {
      const ext = path.extname(item.media).toLowerCase();
      let mediaPath: string | undefined;

      if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        mediaPath = path.join(process.cwd(), 'public/item_photos', item.media);
      } else if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) {
        mediaPath = path.join(process.cwd(), 'public/item_videos', item.media);
      }

      if (mediaPath && fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }

    await this.itemModel.findByIdAndDelete(id);
  }
}
