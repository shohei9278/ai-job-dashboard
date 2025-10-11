import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
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

}
