import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    filters: {
      folderId?: string;
      view?: 'all' | 'favorites' | 'archive' | 'trash';
    },
  ) {
    const where: Prisma.NoteWhereInput = { userId };

    if (filters.folderId === 'null') {
      where.folderId = null;
    } else if (filters.folderId && filters.folderId !== 'all') {
      where.folderId = filters.folderId;
      return this.prisma.note.findMany({
        where,
        include: { tags: { include: { tag: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    switch (filters.view) {
      case 'trash':
        where.deletedAt = { not: null };
        where.OR = [{ folderId: null }, { folder: { deletedAt: null } }];
        break;

      case 'archive':
        where.deletedAt = null;
        where.isArchived = true;
        where.OR = [{ folderId: null }, { folder: { isArchived: false } }];
        break;

      case 'favorites':
        where.deletedAt = null;
        where.isFavorite = true;
        where.OR = [{ folderId: null }, { folder: { isArchived: false } }];
        break;

      case 'all':
      default:
        where.deletedAt = null;
        where.isArchived = false;
        break;
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

    if (!note || note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }

    const { toTrash, ...rest } = dto;
    const updateData: Prisma.NoteUpdateInput = { ...rest };

    if (toTrash !== undefined) {
      updateData.deletedAt = toTrash ? new Date() : null;
    }

    return this.prisma.note.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(userId: string, id: string) {
    const note = await this.prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }

    if (!note.deletedAt) {
      throw new ForbiddenException(
        'Note must be in trash before permanent deletion',
      );
    }

    return this.prisma.note.delete({ where: { id } });
  }

  async calendar(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const filter = {
      userId,
      deletedAt: null,
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    };

    const [notes, folders] = await Promise.all([
      this.prisma.note.findMany({
        where: filter,
        select: { id: true, title: true, createdAt: true },
      }),
      this.prisma.folder.findMany({
        where: filter,
        select: { id: true, name: true, createdAt: true },
      }),
    ]);

    const mappedNotes = notes.map((note) => ({
      id: note.id,
      title: note.title,
      createdAt: note.createdAt,
      type: 'note' as const,
    }));

    const mappedFolders = folders.map((folder) => ({
      id: folder.id,
      title: folder.name,
      createdAt: folder.createdAt,
      type: 'folder' as const,
    }));

    return [...mappedNotes, ...mappedFolders].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }
}
