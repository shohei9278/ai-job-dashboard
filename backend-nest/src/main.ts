import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  (BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
  const app = await NestFactory.create(AppModule);


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
