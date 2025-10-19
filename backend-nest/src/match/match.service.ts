import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from "openai";

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) { }

  private openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY,
    defaultQuery: { "api-version": "2024-04-01-preview" },
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/gpt-4o-mini`,
    defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
  });
  
  // スキルとマッチした求人を返却
  async getMatchedJobs(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: { user_skills: true },
    });

    if (!user || !user.user_skills?.length) return [];

    const skills = user.user_skills.map(s => s.skill);
    const levelMap = Object.fromEntries(user.user_skills.map(s => [s.skill, s.level]));

    const jobs = await this.prisma.jobs.findMany({
      where: {
        OR: skills.map(skill => ({
          skill_display: { has: skill },
        })),
      },
    });

    // スコアリング
    const weightedJobs = jobs.map(job => {
      let score = 0;
      const jobSkills = job.skills.map(s => s.toLowerCase());
      for (const skill of skills) {
        if (jobSkills.includes(skill.toLowerCase())) {
          const level = levelMap[skill] ?? 1;
          score += 10 * level; // レベル加重
        }
      }
      return { ...job, matchScore: score };
    });

    // 降順ソート
    return weightedJobs.sort((a, b) => b.matchScore - a.matchScore);
  }

    // 求められるスキルと自分のスキルのマッチ度を返却
  async getSkillOverview(userId: string) {
  const user = await this.prisma.users.findUnique({
    where: { id: userId },
    include: { user_skills: true },
  });

  if (!user || !user.user_skills?.length) return { matchRate: 0, detail: [] };

  // すべての求人からスキルを抽出
  const allJobs = await this.prisma.jobs.findMany({
    select: { skill_display: true },
  });

  const skillCounts: Record<string, number> = {};
  for (const job of allJobs) {
    for (const skill of job.skill_display) {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    }
  }

  const totalSkills = Object.keys(skillCounts).length;
  const userSkills = user.user_skills.map(s => s.skill);

  // マッチするスキル数
  const matched = userSkills.filter(s => skillCounts[s] !== undefined);
  const matchRate = Math.round((matched.length / userSkills.length) * 100);

  // スキルごとの求人出現数を返す
  const detail = userSkills.map(skill => ({
    skill,
    jobCount: skillCounts[skill] ?? 0,
  }));

  return { matchRate, detail, totalSkills };
  }

  //  求められるスキルと自分のスキルのギャップ度を返却
  async getSkillGap(userId: string) {
    const userSkills = await this.prisma.user_skills.findMany({
      where: { user_id: userId },
    });

    //  全求人データからスキル出現数を集計
    const jobs = await this.prisma.jobs.findMany({ select: { skills: true, } });

    const skillCounts: Record<string, number> = {};
    for (const job of jobs) {
      if (!job.skills) continue;     

      for (const skill of job.skills) {
        const normalized = skill.trim();
        if (!normalized) continue;
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      }
    }

    //ギャップスコア算出 
    const analysis = Object.entries(skillCounts).map(([skill, demand]) => {
      const user = userSkills.find((u) => u.skill === skill.toLowerCase());
      const level = user?.level ?? 0;
      const gapScore = demand * (5 - level);
      return { skill, demand, level, gapScore };
    });

    //スコア上位10件
    return analysis
      .filter((a) => a.demand > 1)
      .sort((a, b) => b.gapScore - a.gapScore)
      .slice(0, 10);
  }

  // 年収のシュミレート結果を返却
  async simulate(userId: string) {
    const userSkills = await this.prisma.user_skills.findMany({
      where: { user_id: userId },
    });

    if (!userSkills.length) return { averageSalary: 0, matchedJobs: 0,salaryRange: { min: 0, max: 0 }, };

    const jobs = await this.prisma.jobs.findMany({
      select: { salary: true, skills: true },
    });

    let totalWeightedSalary = 0;
    let totalWeight = 0;
    let matchedCount = 0;

    for (const job of jobs) {
      if (!job.salary || !job.skills?.length) continue;

      // 求人スキルとユーザースキルの一致率
      const matched = job.skills.filter((s) =>
        userSkills.some((u) => u.skill.toLowerCase() === s.toLowerCase())
      );
      const matchRate = matched.length / job.skills.length;

      if (matchRate > 0.1) { // 1割以上一致してたら「関連求人」とみなす
        matchedCount++;
        totalWeightedSalary += Number(job.salary) * matchRate;
        totalWeight += matchRate;
      }
    }

    const avg = totalWeight > 0 ? totalWeightedSalary / totalWeight : 0;

    return {
      matchedJobs: matchedCount,
      averageSalary: Math.round(avg),
      salaryRange: {
        min: Math.round(avg * 0.85),
        max: Math.round(avg * 1.15),
      },
    };
  }

  async generateAIComment(userId: string) {

     const userSkills = await this.prisma.user_skills.findMany({
      where: { user_id: userId },
    });

    // 無駄にAPI消費したくない為、スキルが登録されてなければ終了させる
    if (userSkills.length === 0) return    
    

    const [matchedJobs, skillOverview, skillGap, salarySim] = await Promise.all([
      this.getMatchedJobs(userId),
      this.getSkillOverview(userId),
      this.getSkillGap(userId),
      this.simulate(userId),
    ]);

    const prompt = `
    あなたはIT業界の採用アナリストです。
    以下のデータから、ユーザーのスキル傾向を分析し、
    簡潔でわかりやすいキャリアアドバイスコメントを日本語で出力してください。

    [マッチ求人TOP3]
    ${matchedJobs.map(j => `- ${j.title}（${j.company}）`).join("\n")}

    [スキルマッチ率] ${skillOverview.matchRate}%
    [スキルギャップTOP3]
    ${skillGap.map(g => `- ${g.skill}（需要:${g.demand}, レベル:${g.level}）`).slice(0,3).join("\n")}

    [給与シミュレーション]
    平均年収: ${salarySim.averageSalary}円（レンジ: ${salarySim.salaryRange.min}〜${salarySim.salaryRange.max}円）

    フォーマット：
    - 総評：
    - 強み：
    - 改善ポイント：
    - 推奨アクション：
    `;

    let comment

    try {

      const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
      
      });
      
      const message = response.choices[0]?.message?.content ?? "";
     comment = message.trim();
      
    } catch (error) {
      console.log(error);
      
    }

    

    
    return { comment, matchedJobs, skillOverview, skillGap, salarySim };
  }
  
}


