import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @ApiProperty({ example: '123456', description: 'Password' })
  password: string;
}
