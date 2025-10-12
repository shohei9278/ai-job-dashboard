import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SupabaseService } from '../supabase/supabase.service';
import { JobsService } from '../jobs/jobs.service';
import { Trendservice } from '../trends/trends.service';


@Controller('webhook')
export class WebhookController {
  // 一旦標準Loggerでテスト
  private readonly logger = new Logger(WebhookController.name);
  
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jobsService: JobsService,
       private readonly Trendservice: Trendservice,
   @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}


  @Post('update')
  async handleWebhook(@Body() payload: any) {
    this.logger.log(`Webhook受信: ${JSON.stringify(payload)}`);

    // python側のデータ更新処理を検知
    if (payload?.type === 'data_update') {

      try {

        await (this.cacheManager as any).clear();
        
          this.logger.log(`キャッシュ削除完了`);

        // if ('store' in this.cacheManager && 'keys' in (this.cacheManager as any).store) {
        //   const keys: string[] = await (this.cacheManager as any).store.keys();
        //   for (const key of keys) {
        //     await this.cacheManager.del(key);
        //   }
        //   this.logger.log(`キャッシュ削除完了 (${keys.length} keys)`);
        // } 
         
        await this.jobsService.findJobs({});
        this.logger.log(`求人データ再キャッシュ完了`);

         await this.Trendservice.getUnifiedTrends();
        this.logger.log(`レンドドデータ再キャッシュ完了`);

    
      // const latestData = await this.supabaseService.fetchLatestTrends();
      // // メモリキャッシュに保存（一日）
      // await this.cacheManager.set('latest_trends', latestData, 24 * 60 * 60 * 1000);
      // this.logger.log('レンドドデータキャッシュ更新完了');
      // } catch (error) {
      //   this.logger.error('キャッシュ処理中にエラー:', error);
        // }
        
       }  catch (error) {
        this.logger.error('キャッシュ処理中にエラー:', error);
      }

     

    }

    return { status: 'ok', received: true, type: payload?.type || 'unknown' };
  }
}