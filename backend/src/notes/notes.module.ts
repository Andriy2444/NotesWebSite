import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotesGateway } from './notes.gateway';

@Module({
  controllers: [NotesController],
  providers: [NotesService, PrismaService, NotesGateway],
})
export class NotesModule {}
