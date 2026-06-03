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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSchema = exports.Item = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Item = class Item {
};
exports.Item = Item;
__decorate([
    (0, mongoose_1.Prop)({ required: [true, 'Item name is required'], trim: true }),
    __metadata("design:type", String)
], Item.prototype, "itemName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: [true, 'Description is required'], trim: true }),
    __metadata("design:type", String)
], Item.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: [true, 'Item type is required'],
        type: String,
        enum: ['lost', 'found'],
    }),
    __metadata("design:type", String)
], Item.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required'],
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Item.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: [true, 'Location is required'],
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters'],
    }),
    __metadata("design:type", String)
], Item.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: [true, 'Media is required'], trim: true }),
    __metadata("design:type", String)
], Item.prototype, "media", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['photo', 'video'], default: 'photo' }),
    __metadata("design:type", String)
], Item.prototype, "mediaType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Student', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Item.prototype, "claimedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Item.prototype, "isClaimed", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Reported by is required'],
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Item.prototype, "reportedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['available', 'claimed', 'resolved'],
        default: 'available',
    }),
    __metadata("design:type", String)
], Item.prototype, "status", void 0);
exports.Item = Item = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Item);
exports.ItemSchema = mongoose_1.SchemaFactory.createForClass(Item);
//# sourceMappingURL=item.schema.js.map