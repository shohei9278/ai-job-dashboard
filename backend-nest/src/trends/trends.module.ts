import { Module } from '@nestjs/common';
import { Trendservice } from './trends.service';
import { TrendsController } from './trends.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TrendsController],
  providers: [Trendservice, PrismaService],
})
export class TrendsModule {}