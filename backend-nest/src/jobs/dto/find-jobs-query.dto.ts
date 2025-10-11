import { IsOptional, IsString, IsNumberString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindJobsQueryDto {
  @ApiPropertyOptional({ description: 'キーワード（タイトル・本文）' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '勤務地（例: 東京）' })
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsNumberString()
  minSalary?: string;

  @IsOptional()
  @IsNumberString()
  maxSalary?: string;

@ApiPropertyOptional({ description: 'スキル（例：AWS）' })
 @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(v => decodeURIComponent(v));
    if (typeof value === 'string') {
      return value.includes(',')
        ? value.split(',').map(v => decodeURIComponent(v.trim()))
        : [decodeURIComponent(value.trim())];
    }
    return [];
  })
 skills?: string[];
  
  @IsOptional()
  @IsString()
  mode?: 'any' | 'all';

}