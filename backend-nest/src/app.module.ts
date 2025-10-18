import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { TrendsModule } from './trends/trends.module';
import { PrismaModule } from './prisma/prisma.module';
import { WebhookModule } from './webhook/webhook.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { MatchModule } from './match/match.module';

@Module({
  imports: [PrismaModule, JobsModule,TrendsModule,WebhookModule,HealthModule,AuthModule,UsersModule,ProfileModule,MatchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
