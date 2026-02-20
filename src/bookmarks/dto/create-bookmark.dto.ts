import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookmarkDto {
  @ApiProperty({ example: 1, description: 'Verse ID to bookmark' })
  @IsInt()
  verseId: number;

  @ApiPropertyOptional({ example: 'Important verse about patience', description: 'Optional note' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
