
import { Controller, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { MatchService } from './match.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) { }
  
  // スキルとマッチした求人を取得
  
  @Get()
  async getMatchedJobs(@Req() req) {
    const userId = req.user?.sub ?? null; 
    if (!userId) throw new UnauthorizedException('ユーザー情報が見つかりません');
    return this.matchService.getMatchedJobs(userId);
  }

  //  求められるスキルと自分のスキルのマッチ度を取得
@Get('overview')

async getSkillOverview(@Req() req) {
   const userId = req.user?.sub ?? null; 
  if (!userId) throw new UnauthorizedException('ユーザー情報が見つかりません');
  return this.matchService.getSkillOverview(userId);
}
  
  
  @Get("skill-gap")
  async getSkillGap(@Req() req) {
  const userId = req.user?.sub ?? null; 
  if (!userId) throw new UnauthorizedException('ユーザー情報が見つかりません');
    const result = await this.matchService.getSkillGap(userId);
    return { userId, result };
  }

  
  @Get("salary-sim")
  async getSimulation(@Req() req) {
    const userId = req.user?.sub ?? null; 
  if (!userId) throw new UnauthorizedException('ユーザー情報が見つかりません');
    return this.matchService.simulate(userId);
  }

  @Get("summary")
  async getAIComment(@Req() req) {
    const userId = req.user?.sub ?? null; 
  if (!userId) throw new UnauthorizedException('ユーザー情報が見つかりません');
    return this.matchService.generateAIComment(userId);
  }
}
