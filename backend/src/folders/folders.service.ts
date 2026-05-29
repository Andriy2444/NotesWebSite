import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Prisma, SpaceType } from '@prisma/client';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFolderDto) {
    const existing = await this.prisma.folder.findFirst({
      where: {
        userId,
        parentId: dto.parentId ?? null,
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Folder with this name already exists');
    }

    let spaceType: SpaceType = SpaceType.PRIVATE;
    if (dto.parentId) {
      const parentFolder = await this.prisma.folder.findUnique({
        where: { id: dto.parentId },
      });
      if (parentFolder?.spaceType === 'SHARED') {
        spaceType = 'SHARED';
      }
    }

    return this.prisma.folder.create({
      data: {
        name: dto.name,
        parentId: dto.parentId ?? null,
        userId,
        spaceType,
      },
    });
  }

  async findAll(
    userId: string,
    filters: {
      parentId?: string;
      view?: 'all' | 'favorites' | 'archive' | 'trash';
      space?: 'private' | 'shared';
    },
  ) {
    const isShared = filters.space === 'shared';

    if (isShared) {
      return this.prisma.folder.findMany({
        where: {
          OR: [
            { userId: userId, spaceType: 'SHARED' },
            { sharedWith: { some: { userId: userId } } },
          ],
          deletedAt: null,
          isArchived: false,
          ...(filters.parentId && filters.parentId !== 'null'
            ? { parentId: filters.parentId }
            : { parentId: null }), // ← фікс — показуємо тільки папки верхнього рівня
        },
        include: {
          _count: { select: { notes: true } },
          sharedWith: {
            include: {
              user: { select: { id: true, username: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const where: Prisma.FolderWhereInput = { userId, spaceType: 'PRIVATE' };

    if (filters.parentId === 'null') {
      where.parentId = null;
    } else if (filters.parentId) {
      where.parentId = filters.parentId;
      return this.prisma.folder.findMany({
        where,
        include: { _count: { select: { notes: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    switch (filters.view) {
      case 'trash':
        where.deletedAt = { not: null };
        break;
      case 'archive':
        where.deletedAt = null;
        where.isArchived = true;
        break;
      case 'favorites':
        where.deletedAt = null;
        where.isFavorite = true;
        break;
      case 'all':
      default:
        where.deletedAt = null;
        where.isArchived = false;
        break;
    }

    return this.prisma.folder.findMany({
      where,
      include: { _count: { select: { notes: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFolderNotes(userId: string, folderId: string) {
    const folder = await this.prisma.folder.findFirst({
      where: {
        id: folderId,
        OR: [{ userId }, { sharedWith: { some: { userId } } }],
      },
    });

    if (!folder) throw new ForbiddenException('Access denied');

    return this.prisma.note.findMany({
      where: {
        folderId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateFolderDto) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder) throw new NotFoundException('Folder not found');

    if (folder.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: Prisma.FolderUpdateInput = {
      name: dto.name,
      isFavorite: dto.isFavorite,
      isArchived: dto.isArchived,
    };

    if (dto.toTrash !== undefined) {
      updateData.deletedAt = dto.toTrash ? new Date() : null;
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedFolder = await tx.folder.update({
        where: { id },
        data: updateData,
      });

      return updatedFolder;
    });
  }

  async delete(userId: string, id: string) {
    const folder = await this.prisma.folder.findUnique({ where: { id } });

    if (!folder) throw new NotFoundException('Folder not found');
    if (folder.userId !== userId) throw new ForbiddenException('Access denied');

    if (!folder.deletedAt) {
      throw new ForbiddenException(
        'Folder must be in trash before permanent deletion',
      );
    }

    await this.prisma.$transaction([
      this.prisma.note.deleteMany({ where: { folderId: id, userId } }),
      this.prisma.folder.delete({ where: { id } }),
    ]);

    return { message: 'Folder deleted' };
  }
}
