import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Prisma } from '@prisma/client';
import { NotesGateway } from './notes.gateway';

@Injectable()
export class NotesService {
  constructor(
    private prisma: PrismaService,
    private readonly notesGateway: NotesGateway,
  ) {}

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
      space?: 'private' | 'shared';
    },
  ) {
    const isShared = filters.space === 'shared';

    if (isShared) {
      return this.prisma.note.findMany({
        where: {
          OR: [
            { userId: userId, spaceType: 'SHARED' },
            { sharedWith: { some: { userId: userId } } },
            {
              folder: {
                sharedWith: { some: { userId: userId } },
              },
            },
          ],
          ...(filters.folderId &&
          filters.folderId !== 'null' &&
          filters.folderId !== 'all'
            ? { folderId: filters.folderId }
            : { folderId: null }),
          deletedAt: null,
          isArchived: false,
        },
        include: {
          sharedWith: {
            include: {
              user: { select: { id: true, username: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const where: Prisma.NoteWhereInput = { userId, spaceType: 'PRIVATE' };

    if (filters.folderId === 'null') {
      where.folderId = null;
    } else if (filters.folderId && filters.folderId !== 'all') {
      where.folderId = filters.folderId;
      return this.prisma.note.findMany({
        where,
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        sharedWith: {
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
        folder: {
          include: {
            sharedWith: true,
          },
        },
      },
    });

    if (!note || note.deletedAt) {
      throw new NotFoundException('Note not found');
    }

    const isOwner = note.userId === userId;
    const sharedEntry = note.sharedWith.find((s) => s.userId === userId);
    const hasFolderAccess = note.folder?.sharedWith?.some(
      (s) => s.userId === userId,
    );

    if (!isOwner && !sharedEntry && !hasFolderAccess) {
      throw new NotFoundException('Note not found');
    }

    const role = isOwner ? 'EDITOR' : (sharedEntry?.role ?? 'VIEWER');

    return { ...note, role };
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: { sharedWith: true },
    });

    if (!note || note.deletedAt) {
      throw new NotFoundException('Note not found');
    }

    const isOwner = note.userId === userId;
    const isEditor = note.sharedWith.some(
      (s) => s.userId === userId && s.role === 'EDITOR',
    );

    if (!isOwner && !isEditor) {
      throw new ForbiddenException(
        'You do not have permission to edit this note',
      );
    }

    const { toTrash, ...rest } = dto;
    const updateData: Prisma.NoteUpdateInput = { ...rest };

    if (toTrash !== undefined) {
      if (!isOwner) {
        throw new ForbiddenException(
          'Only the owner can move this note to trash',
        );
      }
      updateData.deletedAt = toTrash ? new Date() : null;
    }

    const isContentChanged =
      dto.content !== undefined && dto.content !== note.content;
    const isTitleChanged = dto.title !== undefined && dto.title !== note.title;

    if ((isContentChanged || isTitleChanged) && toTrash === undefined) {
      const lastVersion = await this.prisma.noteVersion.findFirst({
        where: { noteId: id },
        orderBy: { createdAt: 'desc' },
      });

      const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
      const now = new Date().getTime();

      const shouldCreateNewVersion =
        !lastVersion ||
        now - new Date(lastVersion.createdAt).getTime() > FIVE_MINUTES_IN_MS;

      if (shouldCreateNewVersion) {
        await this.prisma.noteVersion.create({
          data: { noteId: note.id, title: note.title, content: note.content },
        });

        const oldVersions = await this.prisma.noteVersion.findMany({
          where: { noteId: id },
          orderBy: { createdAt: 'desc' },
          skip: 20,
          select: { id: true },
        });

        if (oldVersions.length > 0) {
          await this.prisma.noteVersion.deleteMany({
            where: { id: { in: oldVersions.map((v) => v.id) } },
          });
        }
      }
    }

    const updatedNote = await this.prisma.note.update({
      where: { id },
      data: updateData,
    });

    if (isContentChanged || isTitleChanged) {
      this.notesGateway.broadcastNoteUpdate(id, {
        content: updatedNote.content,
        title: updatedNote.title,
        updatedAt: updatedNote.updatedAt,
      });
    }

    return updatedNote;
  }

  async deleteVersion(userId: string, noteId: string, versionId: string) {
    await this.findOne(userId, noteId);

    const version = await this.prisma.noteVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.noteId !== noteId) {
      throw new NotFoundException('Version not found');
    }

    return this.prisma.noteVersion.delete({ where: { id: versionId } });
  }

  async getVersions(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.noteVersion.findMany({
      where: { noteId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async restoreVersion(userId: string, noteId: string, versionId: string) {
    const note = await this.findOne(userId, noteId);

    if (note.role !== 'EDITOR') {
      throw new ForbiddenException('Only editors can restore versions');
    }

    const version = await this.prisma.noteVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.noteId !== noteId) {
      throw new NotFoundException('Version not found');
    }

    await this.prisma.noteVersion.create({
      data: {
        noteId: note.id,
        title: note.title,
        content: note.content,
      },
    });

    return this.prisma.note.update({
      where: { id: noteId },
      data: {
        title: version.title,
        content: version.content,
      },
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

    await this.prisma.noteVersion.deleteMany({ where: { noteId: id } });

    return this.prisma.note.delete({ where: { id } });
  }

  async calendar(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const [notes, folders] = await Promise.all([
      this.prisma.note.findMany({
        where: {
          userId,
          deletedAt: null,
          noteDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: { id: true, title: true, noteDate: true },
      }),
      this.prisma.folder.findMany({
        where: {
          userId,
          deletedAt: null,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: { id: true, name: true, createdAt: true },
      }),
    ]);

    const mappedNotes = notes.map((note) => ({
      id: note.id,
      title: note.title,
      createdAt: note.noteDate,
      type: 'note' as const,
    }));

    const mappedFolders = folders.map((folder) => ({
      id: folder.id,
      title: folder.name,
      createdAt: folder.createdAt,
      type: 'folder' as const,
    }));

    return [...mappedNotes, ...mappedFolders].sort(
      (a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0),
    );
  }
}
