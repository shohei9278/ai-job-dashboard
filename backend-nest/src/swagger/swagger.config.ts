import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('AI Job Dashboard API')
    .setDescription('求人分析・AIコメント生成APIドキュメント')
    .setVersion('1.0')
    .addTag('jobs', '求人データ関連API')
    .addTag('trends', 'トレンド分析・予測API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}