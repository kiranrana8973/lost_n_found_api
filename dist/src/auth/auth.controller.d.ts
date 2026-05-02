import { StudentsService } from '../students/students.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    refreshToken(dto: RefreshTokenDto, authorization?: string): Promise<{
        success: boolean;
        token: any;
        refreshToken: string;
        data: Record<string, unknown>;
    }>;
}
