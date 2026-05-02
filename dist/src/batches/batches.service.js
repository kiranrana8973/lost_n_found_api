"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const batch_schema_1 = require("./schemas/batch.schema");
let BatchesService = class BatchesService {
    constructor(batchModel) {
        this.batchModel = batchModel;
    }
    async create(dto) {
        return this.batchModel.create(dto);
    }
    async findAll() {
        return this.batchModel.find();
    }
    async findById(id) {
        const batch = await this.batchModel.findById(id);
        if (!batch)
            throw new common_1.NotFoundException('Batch not found');
        return batch;
    }
    async update(id, dto) {
        const batch = await this.batchModel.findByIdAndUpdate(id, dto, {
            new: true,
            runValidators: true,
        });
        if (!batch)
            throw new common_1.NotFoundException('Batch not found');
        return batch;
    }
};
exports.BatchesService = BatchesService;
exports.BatchesService = BatchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(batch_schema_1.Batch.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BatchesService);
//# sourceMappingURL=batches.service.js.map