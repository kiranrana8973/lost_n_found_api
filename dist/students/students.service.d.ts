import { Model } from 'mongoose';
import { Student, StudentDocument } from './schemas/student.schema';
import { RefreshTokenDocument } from './schemas/refresh-token.schema';
import { BatchesService } from '../batches/batches.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import { ConfigService } from '@nestjs/config';
export declare class StudentsService {
    private studentModel;
    private refreshTokenModel;
    private batchesService;
    private configService;
    constructor(studentModel: Model<StudentDocument>, refreshTokenModel: Model<RefreshTokenDocument>, batchesService: BatchesService, configService: ConfigService);
    private hashToken;
    private generateRefreshToken;
    create(dto: CreateStudentDto): Promise<Record<string, unknown>>;
    login(dto: LoginStudentDto): Promise<{
        success: boolean;
        token: any;
        refreshToken: string;
        data: Record<string, unknown>;
    }>;
    logout(refreshToken?: string): Promise<void>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, StudentDocument, {}, import("mongoose").DefaultSchemaOptions> & Student & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, StudentDocument, {}, import("mongoose").DefaultSchemaOptions> & Student & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateStudentDto, currentUserId: string): Promise<import("mongoose").Document<unknown, {}, StudentDocument, {}, import("mongoose").DefaultSchemaOptions> & Student & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string, currentUserId: string): Promise<void>;
    refreshAccessToken(rawRefreshToken: string): Promise<{
        success: boolean;
        token: any;
        refreshToken: string;
        data: Record<string, unknown>;
    }>;
}
