import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Category, CategoryDocument } from "./schemas/category.schema";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto) {
    return this.categoryModel.create(dto);
  }

  async findAll() {
    return this.categoryModel.find({ status: "active" });
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  async delete(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) throw new NotFoundException("Category not found");
  }
}
