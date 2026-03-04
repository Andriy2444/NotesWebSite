import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return this.usersService.getMe(req.user.id);
  }

  @Patch('me')
  updateMe(@Req() req: AuthRequest, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.id, dto);
  }
}
