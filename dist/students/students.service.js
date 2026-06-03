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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const student_schema_1 = require("./schemas/student.schema");
const refresh_token_schema_1 = require("./schemas/refresh-token.schema");
const batches_service_1 = require("../batches/batches.service");
const config_1 = require("@nestjs/config");
let StudentsService = class StudentsService {
    constructor(studentModel, refreshTokenModel, batchesService, configService) {
        this.studentModel = studentModel;
        this.refreshTokenModel = refreshTokenModel;
        this.batchesService = batchesService;
        this.configService = configService;
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    generateRefreshToken() {
        return crypto.randomBytes(40).toString('hex');
    }
    async create(dto) {
        await this.batchesService.findById(dto.batchId);
        const existingEmail = await this.studentModel.findOne({ email: dto.email });
        if (existingEmail)
            throw new common_1.BadRequestException('Email already exists');
        const existingUsername = await this.studentModel
            .findOne({ username: dto.username })
            .collation({ locale: 'en', strength: 2 });
        if (existingUsername)
            throw new common_1.BadRequestException('Username already exists');
        const student = await this.studentModel.create({
            ...dto,
            profilePicture: dto.profilePicture || 'default-profile.png',
        });
        const studentResponse = student.toObject();
        delete studentResponse.password;
        return studentResponse;
    }
    async login(dto) {
        const student = await this.studentModel
            .findOne({ email: dto.email })
            .select('+password');
        if (!student || !(await student.matchPassword(dto.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const accessToken = student.getSignedJwtToken();
        const rawRefreshToken = this.generateRefreshToken();
        const hashedRefreshToken = this.hashToken(rawRefreshToken);
        const refreshExpireDays = this.configService.get('REFRESH_TOKEN_EXPIRE_DAYS', 7);
        await this.refreshTokenModel.create({
            token: hashedRefreshToken,
            student: student._id,
            expiresAt: new Date(Date.now() + refreshExpireDays * 24 * 60 * 60 * 1000),
        });
        const userResponse = student.toObject();
        delete userResponse.password;
        return {
            success: true,
            token: accessToken,
            refreshToken: rawRefreshToken,
            data: userResponse,
        };
    }
    async logout(refreshToken) {
        if (refreshToken) {
            const hashedToken = this.hashToken(refreshToken);
            await this.refreshTokenModel.deleteOne({ token: hashedToken });
        }
    }
    async findAll() {
        return this.studentModel.find().populate('batchId', 'batchName');
    }
    async findById(id) {
        const student = await this.studentModel
            .findById(id)
            .populate('batchId', 'batchName');
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        return student;
    }
    async update(id, dto, currentUserId) {
        const student = await this.studentModel.findById(id);
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        if (student._id.toString() !== currentUserId) {
            throw new common_1.ForbiddenException('Not authorized to update this student profile');
        }
        if (dto.name)
            student.name = dto.name;
        if (dto.email)
            student.email = dto.email;
        if (dto.username)
            student.username = dto.username;
        if (dto.phoneNumber)
            student.phoneNumber = dto.phoneNumber;
        if (dto.batchId)
            student.batchId = dto.batchId;
        if (dto.profilePicture)
            student.profilePicture = dto.profilePicture;
        if (dto.password)
            student.password = dto.password;
        await student.save();
        return student;
    }
    async delete(id, currentUserId) {
        const student = await this.studentModel.findById(id);
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        if (student._id.toString() !== currentUserId) {
            throw new common_1.ForbiddenException('Not authorized to delete this student profile');
        }
        if (student.profilePicture &&
            student.profilePicture !== 'default-profile.png') {
            const profilePicturePath = path.join(process.cwd(), 'public/profile_pictures', student.profilePicture);
            if (fs.existsSync(profilePicturePath)) {
                fs.unlinkSync(profilePicturePath);
            }
        }
        await this.studentModel.findByIdAndDelete(id);
    }
    async refreshAccessToken(rawRefreshToken) {
        const hashedToken = this.hashToken(rawRefreshToken);
        const storedToken = await this.refreshTokenModel.findOne({
            token: hashedToken,
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (storedToken.expiresAt < new Date()) {
            await this.refreshTokenModel.deleteOne({ _id: storedToken._id });
            throw new common_1.UnauthorizedException('Refresh token has expired');
        }
        await this.refreshTokenModel.deleteOne({ _id: storedToken._id });
        const student = await this.studentModel.findById(storedToken.student);
        if (!student)
            throw new common_1.UnauthorizedException('User not found');
        const newAccessToken = student.getSignedJwtToken();
        const newRawRefreshToken = this.generateRefreshToken();
        const newHashedRefreshToken = this.hashToken(newRawRefreshToken);
        const refreshExpireDays = this.configService.get('REFRESH_TOKEN_EXPIRE_DAYS', 7);
        await this.refreshTokenModel.create({
            token: newHashedRefreshToken,
            student: student._id,
            expiresAt: new Date(Date.now() + refreshExpireDays * 24 * 60 * 60 * 1000),
        });
        const userResponse = student.toObject();
        delete userResponse.password;
        return {
            success: true,
            token: newAccessToken,
            refreshToken: newRawRefreshToken,
            data: userResponse,
        };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(student_schema_1.Student.name)),
    __param(1, (0, mongoose_1.InjectModel)(refresh_token_schema_1.RefreshToken.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        batches_service_1.BatchesService,
        config_1.ConfigService])
], StudentsService);
//# sourceMappingURL=students.service.js.map