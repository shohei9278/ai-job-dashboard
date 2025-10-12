import { Injectable, Logger,Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma';
import { FindJobsQueryDto } from './dto/find-jobs-query.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService,
     @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }
  private readonly logger = new Logger(JobsService.name);

  async getRecentJobs(limit = 50) {
    return this.prisma.jobs.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async insertJob(data: any) {
    return this.prisma.jobs.create({ data });
  }

  async findJobs(query: FindJobsQueryDto) {
    const { keyword, location, company, minSalary, maxSalary, skills, mode } = query;
    
    // 正規化
    const normalizedSkills =
      typeof skills === 'string'
        ? [skills]
        : Array.isArray(skills)
        ? skills
          : [];
    
    const cacheKey = `jobs_${JSON.stringify({
      keyword,
      location,
      company,
      minSalary,
      maxSalary,
      skills: normalizedSkills,
      mode,
    })}`;

    // キャッシュ確認
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.log(`キャッシュから求人データを取得: ${cacheKey}`);
      return cached;
    }

    const jobs = this.prisma.jobs.findMany({
      where: {
        AND: [
          keyword
            ? {
                OR: [
                  { title: { contains: keyword, mode: 'insensitive' } },
                  { summary: { contains: keyword, mode: 'insensitive' } },
                  { description: { contains: keyword, mode: 'insensitive' } },
                ],
              }
            : {},
          location ? { location: { contains: location, mode: 'insensitive' } } : {},
          company ? { company: { contains: company, mode: 'insensitive' } } : {},
          minSalary ? { salary: { gte: Number(minSalary) } } : {},
          maxSalary ? { salary: { lte: Number(maxSalary) } } : {},
          normalizedSkills.length > 0 ? {
            skills:
              mode === 'all'
                ? { hasEvery: normalizedSkills }
                : { hasSome: normalizedSkills },
          }: {},
        ],
      },
      orderBy: {
        collected_date: 'desc',
      }
    });

    // キャッシュ保存(1日)
    await this.cacheManager.set(cacheKey, jobs, 24 * 60 * 60 * 1000);
    
    return jobs
  }

}