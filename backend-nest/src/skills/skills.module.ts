import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  providers: [SkillsService, PrismaService, JwtAuthGuard],
  controllers: [SkillsController],
  exports: [SkillsService]
})
export class SkillsModule {}