import { Response } from 'express';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import { ConfigService } from '@nestjs/config';
export declare class StudentsController {
    private readonly studentsService;
    private readonly configService;
    constructor(studentsService: StudentsService, configService: ConfigService);
    create(dto: CreateStudentDto): Promise<{
        success: boolean;
        data: Record<string, unknown>;
    }>;
    login(dto: LoginStudentDto, res: Response): Promise<{
        success: boolean;
        token: any;
        refreshToken: string;
        data: Record<string, unknown>;
    }>;
    logout(refreshToken: string, res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    uploadProfilePicture(file: Express.Multer.File): Promise<{
        success: boolean;
        data: string;
    }>;
    getMe(user: any): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/student.schema").StudentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/student.schema").Student & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    findAll(): Promise<{
        success: boolean;
        count: number;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/student.schema").StudentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/student.schema").Student & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/student.schema").StudentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/student.schema").Student & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    update(id: string, dto: UpdateStudentDto, user: any): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("./schemas/student.schema").StudentDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/student.schema").Student & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    remove(id: string, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
