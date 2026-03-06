import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFolderDto {
  @ApiProperty({
    example: 'Work',
    description: 'Name of the folder (at least 3 characters)',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;
}
