import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReadingProgressDto {
  @ApiProperty({ example: 1, description: 'Last read verse ID' })
  @IsInt()
  verseId: number;

  @ApiPropertyOptional({ example: 1, description: 'Surah number (1-114)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(114)
  surahNumber?: number;

  @ApiPropertyOptional({ example: 1, description: 'Page number (1-604)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(604)
  pageNumber?: number;
}
