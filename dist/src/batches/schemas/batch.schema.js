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
exports.BatchSchema = exports.Batch = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Batch = class Batch {
};
exports.Batch = Batch;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        maxlength: 50,
        minlength: 2,
        index: true,
    }),
    __metadata("design:type", String)
], Batch.prototype, "batchName", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active',
    }),
    __metadata("design:type", String)
], Batch.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Batch.prototype, "createdAt", void 0);
exports.Batch = Batch = __decorate([
    (0, mongoose_1.Schema)()
], Batch);
exports.BatchSchema = mongoose_1.SchemaFactory.createForClass(Batch);
//# sourceMappingURL=batch.schema.js.map