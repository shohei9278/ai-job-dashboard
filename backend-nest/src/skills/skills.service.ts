import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async saveSkills(userId: string, skills: { skill: string; level: number }[]) {

    if (skills) {
      
    }
    // 既存スキルを削除して再登録
    await this.prisma.user_skills.deleteMany({ where: { user_id: userId } });

    // 新しいスキルを登録
    return await this.prisma.user_skills.createMany({
      data: skills.map((s) => ({
        user_id: userId,
        skill: s.skill,
        level: s.level,
      })),
    });
  }

    async getSkills(userId: string) {
    return this.prisma.user_skills.findMany({ where: { user_id: userId },select: { skill: true, level: true },
      orderBy: { created_at: 'asc' }, });
    }
  
}
