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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentSchema = exports.Student = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
let Student = class Student {
};
exports.Student = Student;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Student.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: [true, 'Please add an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    }),
    __metadata("design:type", String)
], Student.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, trim: true }),
    __metadata("design:type", String)
], Student.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: [true, 'Please add a password'],
        minlength: 8,
        select: false,
    }),
    __metadata("design:type", String)
], Student.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Student.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Batch', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Student.prototype, "batchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'default-profile.png', trim: true }),
    __metadata("design:type", String)
], Student.prototype, "profilePicture", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'student', enum: ['student', 'admin'] }),
    __metadata("design:type", String)
], Student.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Student.prototype, "createdAt", void 0);
exports.Student = Student = __decorate([
    (0, mongoose_1.Schema)({ timestamps: false })
], Student);
exports.StudentSchema = mongoose_1.SchemaFactory.createForClass(Student);
exports.StudentSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
exports.StudentSchema.methods.getSignedJwtToken = function () {
    const expiresIn = process.env.JWT_EXPIRE || '30d';
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: expiresIn,
    });
};
exports.StudentSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};
//# sourceMappingURL=student.schema.js.map