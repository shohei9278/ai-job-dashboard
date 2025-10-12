import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { JobsModule } from '../jobs/jobs.module';
import { JobsService } from '../jobs/jobs.service';
import { CacheModule } from '@nestjs/cache-manager';
@Module({
  imports: [
    CacheModule.register(),
    SupabaseModule, 
    JobsModule
  ],
  controllers: [WebhookController],
})
export class WebhookModule {}