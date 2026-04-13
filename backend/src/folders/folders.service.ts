import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Prisma } from '@prisma/client';

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

    return this.prisma.folder.create({
      data: {
        name: dto.name,
        parentId: dto.parentId ?? null,
        userId,
      },
    });
  }

  async findAll(
    userId: string,
    filters: {
      parentId?: string;
      view?: 'all' | 'favorites' | 'archive' | 'trash';
    },
  ) {
    const where: Prisma.FolderWhereInput = { userId };

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
    return this.prisma.note.findMany({
      where: {
        userId,
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
