import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { TrendsModule } from './trends/trends.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, JobsModule,TrendsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
