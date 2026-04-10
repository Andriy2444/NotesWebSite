import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) throw new ConflictException('Email already exists');

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash: hash,
        settings: {
          create: {
            theme: 'dark',
          },
        },
      },
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(dto: LoginDto, req?: Request) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.email, req);
  }

  async generateTokens(
    userId: string,
    email: string,
    req?: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync({
      sub: userId,
      email,
    });

    const refreshToken = randomUUID();
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    let deviceName = 'Unknown Device';

    if (req?.headers['user-agent']) {
      const ua = new UAParser(req.headers['user-agent']);
      const browser = ua.getBrowser();
      const os = ua.getOS();
      const device = ua.getDevice();

      deviceName = device.model
        ? `${device.vendor || ''} ${device.model} (${os.name})`
        : `${os.name || 'Unknown OS'}, ${browser.name || 'Unknown Browser'}`;
    }

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 днів
        device: deviceName,
        ipAddress: req?.ip || '0.0.0.0',
      },
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string, req?: Request) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    let stored: (typeof storedTokens)[number] | null = null;

    for (const t of storedTokens) {
      const isMatch = await bcrypt.compare(refreshToken, t.tokenHash);
      if (isMatch) {
        stored = t;
        break;
      }
    }

    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.refreshToken.deleteMany({
      where: { id: stored.id },
    });

    return this.generateTokens(stored.user.id, stored.user.email, req);
  }

  async logout(refreshToken: string) {
    const storedTokens = await this.prisma.refreshToken.findMany();

    let stored: (typeof storedTokens)[number] | null = null;
    for (const t of storedTokens) {
      const isMatch = await bcrypt.compare(refreshToken, t.tokenHash);
      if (isMatch) {
        stored = t;
        break;
      }
    }

    if (stored) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    }

    return { message: 'Logged out' };
  }

  async sessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        device: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async terminateSession(userId: string, sessionId: string) {
    const session = await this.prisma.refreshToken.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Session not found');
    }

    await this.prisma.refreshToken.delete({ where: { id: sessionId } });
    return { message: 'Session terminated' };
  }
}
