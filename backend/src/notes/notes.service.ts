import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(
    userId: string,
    filters: { folderId?: string; isFavorite?: boolean; isArchived?: boolean },
  ) {
    const where: Prisma.NoteWhereInput = { userId };

    if (filters.folderId === 'null') {
      where.folderId = null;
    } else if (filters.folderId) {
      where.folderId = filters.folderId;
    }

    if (filters.isFavorite) {
      where.isFavorite = true;
    }

    return this.prisma.note.findMany({
      where,
      include: {
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note || note.userId !== userId || note.deletedAt) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    const note = await this.prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== userId || note.deletedAt) {
      throw new NotFoundException('Note not found');
    }

    return this.prisma.note.update({
      where: { id },
      data: { ...dto },
    });
  }

  async softDelete(userId: string, id: string) {
    const note = await this.prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }

    return this.prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDelete(userId: string, id: string) {
    const note = await this.prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }

    return this.prisma.note.delete({ where: { id } });
  }

  async calendar(userId: string) {
    return this.prisma.note.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        title: true,
        noteDate: true,
      },
    });
  }
}
