import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ example: 'My first note' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'This is the content of the note.' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'uuid-of-folder' })
  @IsOptional()
  @IsString()
  folderId?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({ example: '2026-03-05T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  noteDate?: string;
}