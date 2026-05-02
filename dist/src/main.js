"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.use((0, cookie_parser_1.default)());
    app.use((0, helmet_1.default)());
    const corsOrigins = configService.get('CORS_ORIGIN', '');
    const allowedOrigins = corsOrigins.split(',').filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                const isDev = configService.get('NODE_ENV') !== 'production';
                return callback(null, isDev);
            }
            if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        optionsSuccessStatus: 200,
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    console.log(`Server running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map