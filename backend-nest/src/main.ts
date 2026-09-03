import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/logger.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { setupSwagger } from './swagger/swagger.config';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  (BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
 const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
 });
  
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  setupSwagger(app);

  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ai-job-dashboard-plum.vercel.app',
  ];

  const envOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
  ]
    .filter(Boolean)
    .map((origin) => origin!.trim());

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  app.enableCors({
    origin: (origin, callback) => {
      // サーバー間通信や curl などのリクエスト（origin なし）を許可
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });


 const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');

  // ✅ Cloud Run のログモニタで起動を検知しやすい
  console.log(`[AI-Job-Dashboard] ✅ NestJS running on port ${port}`);
}
bootstrap();
