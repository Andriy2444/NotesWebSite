import { ApiProperty } from '@nestjs/swagger';
import { ShareRole } from '@prisma/client';

export class ShareItemDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email of user to share with',
  })
  email: string;

  @ApiProperty({ enum: ['VIEWER', 'EDITOR'], default: 'VIEWER' })
  role: ShareRole;
}
