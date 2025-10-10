import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class Trendservice {
  constructor(private prisma: PrismaService) {}

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
    
     const actuals = await this.prisma.prefecture_job_counts.findMany({
       where: {
      collected_date: { gte: sevenDaysAgo, 
      lte: today,  }, 
    },
      orderBy: { collected_date: 'asc' },
    }); 
     
    //  グループ化
     const grouped = actuals.reduce((acc:any, row: any) => {
      const date = row.collected_date;
      acc[date] = (acc[date] || 0) + (row.job_count || 0);
      return acc;
     }, {});

    
     return  Object.entries(grouped)
      .map(([date, total]) => ({
        collected_date: date,
        total_jobs: total,
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
    return await this.prisma.job_insights.findMany({
       select: {
      summary: true,
     },
      orderBy: { date: 'desc' },
      take: 1,
    }); 
  }
  
   // 実測データAIコメント
  async getTrendsSummary() {
    return await this.prisma.job_count_summary.findMany({
       select: {
      summary: true,
     },
      orderBy: { date: 'desc' },
      take: 1,
    });  
  }
  
   // スキル予測データ
  async getTrendsSkill() {
    return await this.prisma.skill_trends.findMany({
      orderBy: { trend_score: 'desc' },
      take: 20,
    });  
   }
  
 
  

}