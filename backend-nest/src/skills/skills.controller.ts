import { Body, Controller,Get, Post, UseGuards, Req,UnauthorizedException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response, Request } from 'express';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }
  @UseGuards(JwtAuthGuard)
   @Get()
   async getUserSkills(@Req() req: Request) {
  
     
     const userId = req.user?.sub ?? null; 
    if (!userId) throw new UnauthorizedException('ユーザー情報が見つかりません');
    return this.skillsService.getSkills(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async saveSkills(@Req() req: Request, @Body() body: any) {
    const userId = req.user?.sub ?? null; 
     if (!userId) throw new UnauthorizedException('ユーザー情報が見つかりません');
    return this.skillsService.saveSkills(userId, body.skills);
  }
}
