import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from './async';
import Student, { IStudent } from '../models/student_model';

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IStudent;
    }
  }
}

// Protect routes
export const protect: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      const user = await Student.findById(decoded.id);
      if (user) {
        req.user = user;
      }
      next();
    } catch (err) {
      return res
        .status(401)
        .json({ message: 'Not authorized to access this route' });
    }
  }
);

// Grant access to specific roles, i.e publisher and admin
export const authorize = (...roles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    // Check if it is admin or publisher. user cannot access
    if (!req.user || !roles.includes(req.user.role || '')) {
      return res.status(403).json({
        message: `User role ${req.user?.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
