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
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const throttler_1 = require("@nestjs/throttler");
const students_service_1 = require("./students.service");
const create_student_dto_1 = require("./dto/create-student.dto");
const update_student_dto_1 = require("./dto/update-student.dto");
const login_student_dto_1 = require("./dto/login-student.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const public_decorator_1 = require("../common/decorators/public.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const parse_object_id_pipe_1 = require("../common/pipes/parse-object-id.pipe");
const multer_config_factory_1 = require("../uploads/multer-config.factory");
const config_1 = require("@nestjs/config");
let StudentsController = class StudentsController {
    constructor(studentsService, configService) {
        this.studentsService = studentsService;
        this.configService = configService;
    }
    async create(dto) {
        const student = await this.studentsService.create(dto);
        return { success: true, data: student };
    }
    async login(dto, res) {
        const result = await this.studentsService.login(dto);
        const cookieExpire = this.configService.get('JWT_COOKIE_EXPIRE', 1);
        res.cookie('token', result.token, {
            expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
        });
        return result;
    }
    async logout(refreshToken, res) {
        await this.studentsService.logout(refreshToken);
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });
        return { success: true, message: 'Logged out successfully' };
    }
    async uploadProfilePicture(file) {
        if (!file)
            throw new common_1.BadRequestException('Please upload a file');
        return { success: true, data: file.filename };
    }
    async getMe(user) {
        const student = await this.studentsService.findById(user._id.toString());
        return { success: true, data: student };
    }
    async findAll() {
        const students = await this.studentsService.findAll();
        return { success: true, count: students.length, data: students };
    }
    async findOne(id) {
        const student = await this.studentsService.findById(id);
        return { success: true, data: student };
    }
    async update(id, dto, user) {
        const student = await this.studentsService.update(id, dto, user._id.toString());
        return { success: true, data: student };
    }
    async remove(id, user) {
        await this.studentsService.delete(id, user._id.toString());
        return { success: true, message: 'Student deleted successfully' };
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { ttl: 60 * 60 * 1000, limit: 5 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_student_dto_1.CreateStudentDto]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { ttl: 15 * 60 * 1000, limit: 5 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_student_dto_1.LoginStudentDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Body)('refreshToken')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profilePicture', multer_config_factory_1.profilePictureMulterOptions)),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "uploadProfilePicture", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', parse_object_id_pipe_1.ParseObjectIdPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', parse_object_id_pipe_1.ParseObjectIdPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_student_dto_1.UpdateStudentDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', parse_object_id_pipe_1.ParseObjectIdPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "remove", null);
exports.StudentsController = StudentsController = __decorate([
    (0, common_1.Controller)('students'),
    __metadata("design:paramtypes", [students_service_1.StudentsService,
        config_1.ConfigService])
], StudentsController);
//# sourceMappingURL=students.controller.js.map