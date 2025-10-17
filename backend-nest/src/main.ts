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

  app.enableCors({
    origin: [
      'http://localhost:5173', // 開発中のViteフロント
      'https://ai-job-dashboard-plum.vercel.app', // デプロイ後のVercel
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
