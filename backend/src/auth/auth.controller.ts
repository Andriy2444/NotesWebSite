import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Auth')
@ApiBearerAuth('JWT')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto, description: 'User registration data' })
  @ApiResponse({
    status: 201,
    description: 'User created',
    schema: { example: { accessToken: '...', refreshToken: '...' } },
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto, description: 'User login data' })
  @ApiResponse({
    status: 200,
    description: 'JWT tokens',
    schema: { example: { accessToken: '...', refreshToken: '...' } },
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ schema: { example: { refreshToken: '...' } } })
  @ApiResponse({
    status: 200,
    description: 'New JWT tokens',
    schema: { example: { accessToken: '...', refreshToken: '...' } },
  })
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiBody({ schema: { example: { refreshToken: '...' } } })
  @ApiResponse({
    status: 200,
    description: 'Logged out',
    schema: { example: { message: 'Logged out' } },
  })
  logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiOperation({ summary: 'Get all active sessions for user' })
  @ApiResponse({
    status: 200,
    description: 'List of refresh tokens / active sessions',
    schema: {
      example: [
        { id: 'uuid-1', createdAt: '2026-03-04T19:28:47.000Z' },
        { id: 'uuid-2', createdAt: '2026-03-04T20:10:12.000Z' },
      ],
    },
  })
  sessions(@Req() req: AuthRequest) {
    return this.authService.sessions(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Logout from specific session' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Session terminated' } },
  })
  terminateSession(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.authService.terminateSession(req.user.id, id);
  }
}
