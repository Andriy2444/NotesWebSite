import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNoteDto {
  @ApiPropertyOptional({
    example: 'Updated title',
    description: 'Updated title of the note',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated content',
    description: 'Updated content of the note',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-folder',
    description: 'Optional new folder ID',
  })
  @IsOptional()
  @IsString()
  folderId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Mark note as archived or not',
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Mark note as favorite or not',
  })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({
    example: '2026-03-06T10:00:00.000Z',
    description: 'Optional updated date',
  })
  @IsOptional()
  @IsDateString()
  noteDate?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Move to trash (true) or restore (false)',
  })
  @IsOptional()
  @IsBoolean()
  toTrash?: boolean;
}
