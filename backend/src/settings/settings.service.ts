import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        theme: 'dark',
      },
      select: {
        theme: true,
        updatedAt: true,
      },
    });
  }

  async updateTheme(userId: string, theme: string) {
    return this.prisma.userSettings.update({
      where: { userId },
      data: { theme },
    });
  }
}