import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(cookieParser());
  app.use(helmet());

  const corsOrigins = configService.get<string>('CORS_ORIGIN', '');
  const allowedOrigins = corsOrigins.split(',').filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl) only in development
      if (!origin) {
        const isDev = configService.get('NODE_ENV') !== 'production';
        return callback(null, isDev);
      }
      if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
