import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Module({
  imports: [PrismaModule],
  controllers: [MatchController],
  providers: [MatchService,JwtAuthGuard],
})
export class MatchModule {}
