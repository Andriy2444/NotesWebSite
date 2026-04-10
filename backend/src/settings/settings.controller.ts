import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags('Settings')
@ApiBearerAuth('JWT')
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({ summary: 'Get settings' })
  @Get()
  async getUserSettings(@Req() req: AuthRequest) {
    return this.settingsService.getSettings(req.user.id);
  }

  @ApiOperation({ summary: 'Update theme from settings' })
  @Patch()
  async updateTheme(@Req() req: AuthRequest, @Body('theme') theme: string) {
    return this.settingsService.updateTheme(req.user.id, theme);
  }
}
