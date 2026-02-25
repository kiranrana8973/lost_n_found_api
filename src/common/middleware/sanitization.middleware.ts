import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  private readonly skipFields = [
    'email',
    'username',
    'password',
    'mediaUrl',
    'profilePicture',
  ];

  use(req: Request, _res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitize(req.body);
    }
    next();
  }

  private sanitize(obj: Record<string, unknown>): Record<string, unknown> {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (this.skipFields.includes(key)) continue;

        if (typeof obj[key] === 'string') {
          obj[key] = (obj[key] as string).replace(/\$/g, '');
          const value = obj[key] as string;
          if (!value.includes('@') && !value.startsWith('http')) {
            obj[key] = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.sanitize(obj[key] as Record<string, unknown>);
        }
      }
    }
    return obj;
  }
}
