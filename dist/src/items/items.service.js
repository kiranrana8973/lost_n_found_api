"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const item_schema_1 = require("./schemas/item.schema");
const pagination_util_1 = require("../common/utils/pagination.util");
let ItemsService = class ItemsService {
    constructor(itemModel) {
        this.itemModel = itemModel;
    }
    async create(dto) {
        return this.itemModel.create(dto);
    }
    async findAll(query) {
        const { page = 1, limit = 10, type, status, category } = query;
        const skip = (page - 1) * limit;
        const filter = {};
        if (type)
            filter.type = type;
        if (status)
            filter.status = status;
        if (category)
            filter.category = category;
        const total = await this.itemModel.countDocuments(filter);
        const items = await this.itemModel
            .find(filter)
            .populate('reportedBy', 'name username')
            .populate('claimedBy', 'name username')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return (0, pagination_util_1.paginatedResponse)(items, total, page, limit);
    }
    async findById(id) {
        const item = await this.itemModel
            .findById(id)
            .populate('reportedBy', 'name username')
            .populate('claimedBy', 'name username')
            .populate('category', 'name');
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        return item;
    }
    async update(id, dto, currentUserId) {
        const item = await this.itemModel.findById(id);
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        if (item.reportedBy.toString() !== currentUserId) {
            throw new common_1.ForbiddenException('Not authorized to update this item');
        }
        if (dto.itemName)
            item.itemName = dto.itemName;
        if (dto.description)
            item.description = dto.description;
        if (dto.type)
            item.type = dto.type;
        if (dto.category)
            item.category = dto.category;
        if (dto.location)
            item.location = dto.location;
        if (dto.media)
            item.media = dto.media;
        if (dto.claimedBy)
            item.claimedBy = dto.claimedBy;
        if (dto.isClaimed !== undefined)
            item.isClaimed = dto.isClaimed;
        if (dto.status)
            item.status = dto.status;
        await item.save();
        return item;
    }
    async delete(id, currentUserId) {
        const item = await this.itemModel.findById(id);
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        if (item.reportedBy.toString() !== currentUserId) {
            throw new common_1.ForbiddenException('Not authorized to delete this item');
        }
        if (item.media && item.media !== 'default.jpg') {
            const ext = path.extname(item.media).toLowerCase();
            let mediaPath;
            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                mediaPath = path.join(process.cwd(), 'public/item_photos', item.media);
            }
            else if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) {
                mediaPath = path.join(process.cwd(), 'public/item_videos', item.media);
            }
            if (mediaPath && fs.existsSync(mediaPath)) {
                fs.unlinkSync(mediaPath);
            }
        }
        await this.itemModel.findByIdAndDelete(id);
    }
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(item_schema_1.Item.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ItemsService);
//# sourceMappingURL=items.service.js.map