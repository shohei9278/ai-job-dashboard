import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get ,Header} from '@nestjs/common';
import { Trendservice } from './trends.service';

@Controller('trends')
export class TrendsController {
  constructor(private readonly Trendservice: Trendservice) {}

  @Get()
  async getJobs() {
   return this.Trendservice.getRecentTrends()
  }

  @Get('actual')
  async getActual() {
   return this.Trendservice.getTrendsActual()
  }

   @Get('forecast')
  async getForecast() {
   return this.Trendservice.getTrendsForecast()
  }

  @Get('insight')
  async getInsight() {
   return this.Trendservice.getTrendsInsight()
  }

   @Get('summary')
  async getSummary() {
   return this.Trendservice.getTrendsSummary()
   }
  
   @Get('skill')
  async getSkill() {
   return this.Trendservice.getTrendsSkill()
   }
  @Header('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
  @Get('integration')
  @ApiOperation({ summary: '求人トレンド＋AIコメント統合API' })
  @ApiResponse({ status: 200, description: 'トレンド＋AIコメントを返す' })
  async getIntegration() {
   return this.Trendservice.getUnifiedTrends()
  }

}
