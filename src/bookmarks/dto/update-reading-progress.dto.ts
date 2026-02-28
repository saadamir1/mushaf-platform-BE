import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReadingProgressDto {
  @ApiProperty({ example: 1, description: 'Last read page number' })
  @IsInt()
  pageNumber: number;
}
