import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma';
import { FindJobsQueryDto } from './dto/find-jobs-query.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) { }
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
    const { keyword, location, company, minSalary, maxSalary, skills,mode } = query;
    

    const normalizedSkills =
      typeof skills === 'string'
        ? [skills]
        : Array.isArray(skills)
        ? skills
          : [];
    

    return this.prisma.jobs.findMany({
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
        salary: 'desc',
      },
      take: 50,
    });
  }

}