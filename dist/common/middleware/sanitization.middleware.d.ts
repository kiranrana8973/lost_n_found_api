import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class SanitizationMiddleware implements NestMiddleware {
    private readonly skipFields;
    use(req: Request, _res: Response, next: NextFunction): void;
    private sanitize;
}
