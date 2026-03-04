import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  NotContains,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  @ApiProperty({ example: 'myuser', description: 'Username' })
  username: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @NotContains(' ', { message: 'Password cannot contain spaces' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak: add uppercase, lowercase, and a number',
  })
  @ApiProperty({ example: '123456', description: 'Password' })
  password: string;
}
