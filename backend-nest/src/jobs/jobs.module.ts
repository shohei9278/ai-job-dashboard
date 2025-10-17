import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [SkillsModule],
  controllers: [JobsController],
  providers: [JobsService, PrismaService],
   exports: [JobsService],
})
export class JobsModule {}