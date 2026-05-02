"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizationMiddleware = void 0;
const common_1 = require("@nestjs/common");
let SanitizationMiddleware = class SanitizationMiddleware {
    constructor() {
        this.skipFields = [
            'email',
            'username',
            'password',
            'mediaUrl',
            'profilePicture',
        ];
    }
    use(req, _res, next) {
        if (req.body) {
            req.body = this.sanitize(req.body);
        }
        next();
    }
    sanitize(obj) {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (this.skipFields.includes(key))
                    continue;
                if (typeof obj[key] === 'string') {
                    obj[key] = obj[key].replace(/\$/g, '');
                    const value = obj[key];
                    if (!value.includes('@') && !value.startsWith('http')) {
                        obj[key] = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    }
                }
                else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    this.sanitize(obj[key]);
                }
            }
        }
        return obj;
    }
};
exports.SanitizationMiddleware = SanitizationMiddleware;
exports.SanitizationMiddleware = SanitizationMiddleware = __decorate([
    (0, common_1.Injectable)()
], SanitizationMiddleware);
//# sourceMappingURL=sanitization.middleware.js.map