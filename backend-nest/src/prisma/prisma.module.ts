import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // どこからでも呼べるようにする
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}