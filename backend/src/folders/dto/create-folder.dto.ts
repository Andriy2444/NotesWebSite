import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({
    example: 'Work',
    description: 'Name of the folder (at least 3 characters)',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({
    example: 'uuid-of-parent-folder',
    description: 'Optional ID of parent folder',
  })
  @IsString()
  @IsOptional()
  parentId?: string;
}
