"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : exceptionResponse.message || exception.message;
            if (Array.isArray(message)) {
                message = message.join(', ');
            }
        }
        else if (exception instanceof Error) {
            const err = exception;
            if (err.code === 11000) {
                status = common_1.HttpStatus.BAD_REQUEST;
                const field = Object.keys(err.keyValue || {})[0];
                message = `${field} already exists`;
            }
            else if (err.name === 'ValidationError') {
                status = common_1.HttpStatus.BAD_REQUEST;
                const messages = Object.values(err.errors || {}).map((val) => val.message);
                message = messages.join(', ');
            }
            else if (err.name === 'CastError') {
                status = common_1.HttpStatus.NOT_FOUND;
                message = 'Resource not found';
            }
            else if (err.name === 'JsonWebTokenError') {
                status = common_1.HttpStatus.UNAUTHORIZED;
                message = 'Invalid token';
            }
            else if (err.name === 'TokenExpiredError') {
                status = common_1.HttpStatus.UNAUTHORIZED;
                message = 'Token expired';
            }
            else {
                message = err.message || 'Internal Server Error';
            }
        }
        response.status(status).json({
            success: false,
            message,
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map