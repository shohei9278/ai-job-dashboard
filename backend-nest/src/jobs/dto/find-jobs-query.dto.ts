import { IsOptional, IsString, IsNumberString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindJobsQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

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