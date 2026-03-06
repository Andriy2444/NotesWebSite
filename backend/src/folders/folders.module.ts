import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FoldersController],
  providers: [FoldersService, PrismaService],
})
export class FoldersModule {}
