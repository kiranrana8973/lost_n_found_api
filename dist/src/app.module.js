"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./auth/auth.module");
const students_module_1 = require("./students/students.module");
const batches_module_1 = require("./batches/batches.module");
const categories_module_1 = require("./categories/categories.module");
const items_module_1 = require("./items/items.module");
const comments_module_1 = require("./comments/comments.module");
const sanitization_middleware_1 = require("./common/middleware/sanitization.middleware");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware, sanitization_middleware_1.SanitizationMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: './config/config.env',
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    uri: configService.get('LOCAL_DATABASE_URI'),
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRoot([
                { name: 'default', ttl: 15 * 60 * 1000, limit: 100 },
            ]),
            auth_module_1.AuthModule,
            students_module_1.StudentsModule,
            batches_module_1.BatchesModule,
            categories_module_1.CategoriesModule,
            items_module_1.ItemsModule,
            comments_module_1.CommentsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map