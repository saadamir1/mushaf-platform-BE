import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookmarkDto {
  @ApiProperty({ example: 1, description: 'Page number to bookmark' })
  @IsInt()
  pageNumber: number;

  @ApiPropertyOptional({ example: 'Important page about patience', description: 'Optional note' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
