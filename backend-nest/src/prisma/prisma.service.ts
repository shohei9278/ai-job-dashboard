import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  async onModuleInit() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.slice(0, 50) + '...');
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}