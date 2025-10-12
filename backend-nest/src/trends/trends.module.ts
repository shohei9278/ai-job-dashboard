import { Module } from '@nestjs/common';
import { Trendservice } from './trends.service';
import { TrendsController } from './trends.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
   imports: [
    CacheModule.register({ isGlobal: true }),
  ],
  controllers: [TrendsController],
  providers: [Trendservice, PrismaService],
   exports: [Trendservice],
})
export class TrendsModule {}