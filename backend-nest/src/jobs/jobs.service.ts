import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async getRecentJobs(limit = 50) {
    return this.prisma.jobs.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async insertJob(data: any) {
    return this.prisma.jobs.create({ data });
  }

  async findJobs(filters: { q?: string; skill?: string; location?: string }) {
    const { q, skill, location } = filters;

    // 動的にwhere句を組み立て
    const where: Prisma.jobsWhereInput = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (skill) {
      where.skills = { has: skill }; // text[] カラムに対応
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const jobs = await this.prisma.jobs.findMany({
      where,
      orderBy: { collected_date: 'desc' },
    });

    // BigInt → String に変換（APIレスポンス用）
    return jobs.map((job) => ({
      ...job,
      id: job.id.toString(),
      salary: job.salary?.toString() ?? null,
    }));
  }

}