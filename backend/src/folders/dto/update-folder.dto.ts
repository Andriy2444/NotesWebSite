import { IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFolderDto {
  @ApiPropertyOptional({
    example: 'Work',
    description: 'Name of the folder (at least 3 characters)',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Mark folder as favorite',
  })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Archive the folder',
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Move to trash (true) or restore (false)',
  })
  @IsOptional()
  @IsBoolean()
  toTrash?: boolean;
}
