import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma';


@Injectable()
export class Trendservice {
  constructor(private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }
  private readonly logger = new Logger(Trendservice.name);

  

  async getRecentTrends(limit = 50) {
    return this.prisma.prefecture_job_counts.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  // 実測データ
  async getTrendsActual() {
     
    const today = new Date()
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    
    // DBから直近7日分のデータを取得
     const actuals = await this.prisma.prefecture_job_counts.findMany({
       where: {
      collected_date: { gte: sevenDaysAgo, 
      lte: today,  }, 
    },
      orderBy: { collected_date: 'asc' },
    }); 
     
    //  グループ化
     const grouped = actuals.reduce((acc:any, row: any) => {
      const date = row.collected_date.toISOString().split('T')[0];;
      acc[date] = (acc[date] || 0) + (row.job_count || 0);
      return acc;
     }, {});
    
    // 直近7日の日付リストを生成（データがない日も含める）
     const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    return d.toISOString().split('T')[0];
  });

    
     return dates
      .map(date => ({
        collected_date: date,
        total_jobs: grouped[date] || 0,
      }))
     
   }
  
  async getTrendsForecast() {

    const today = new Date()

    return await this.prisma.job_trend_forecast.findMany({
       select: {
        date: true,
        predicted_count: true,
        lower_bound: true,
        upper_bound: true,
      },
      where: {
      date: { gte: today }, 
    },
      orderBy: { date: 'asc' },
    }); 
     
   }
  
   // 予想データAIコメント
  async getTrendsInsight() {
    return await this.prisma.job_insights.findFirst({
       select: {
      summary: true,
     },
      orderBy: { created_at: 'desc' },
    }); 
  }
  
   // 実測データAIコメント
  async getTrendsSummary() {
    return await this.prisma.job_count_summary.findFirst({
       select: {
      summary: true,
     },
      orderBy: { created_at: 'desc' },
    });  
  }

  async getTrendsScoreSummary() {
    return await this.prisma.trend_score_summary.findFirst({
       select: {
      summary: true,
     },
      orderBy: { created_at: 'desc' },
    }); 
  }

  // AIコメント統合
    async getAiInsights() {
    const [trendInsight, summaryInsight,trendScore] = await Promise.all([
      this.prisma.job_insights.findFirst({ orderBy: { created_at: 'desc' } }),
      this.prisma.job_count_summary.findFirst({ orderBy: { created_at: 'desc' } }),
      this.prisma.trend_score_summary.findFirst({ orderBy: { created_at: 'desc' } }),
    ]);

    return {
      trend_ai_comment:
        trendInsight?.summary || 'AIトレンドコメントがまだ生成されていません。',
      summary_ai_comment:
        summaryInsight?.summary || 'AIサマリーコメントがまだ生成されていません。',
      trend_score_summary:
        trendScore?.summary || 'AIサマリーコメントがまだ生成されていません。',
    };
    }
  
  
  
   // スキル予測データ
  async getTrendsSkill() {

    const latest = await this.prisma.skill_trends.findFirst({
    select: { collected_date: true },
    orderBy: { collected_date: 'desc' },
  });

    if (!latest) return []; 
    
    return await this.prisma.skill_trends.findMany({
      where: {
      collected_date: latest.collected_date,
    },
      orderBy: { trend_score: 'desc' },
      take: 10,
    });  
  }

  // 確認用統合
  async getUnifiedTrends() {
    // キャッシュ確認
    const cached = await this.cacheManager.get('latest_trends');
    
     if (cached) {
      this.logger.log('キャッシュからトレンドデータを取得');
      return cached;
    }

    const [actual, forecast, skills, ai] = await Promise.all([
      this.getTrendsActual(),
      this.getTrendsForecast(),
      this.getTrendsSkill(),
      this.getAiInsights(),
    ]);

    await this.cacheManager.set('latest_trends', { actual, forecast, skills, ai }, 24 * 60 * 60 * 1000);
    this.logger.log('トレンドデータをキャッシュに保存');
    

    return {
      generated_at: new Date().toISOString(),
      actual,
      forecast,
      skills,
      ai,
    };
  }
  
 
  

}