import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookmarkNoteDto {
  @ApiProperty({ example: 'Updated note', description: 'New note for bookmark' })
  @IsString()
  @MaxLength(500)
  note: string;
}
