import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

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

  async findAll(userId: string) {
    return this.prisma.folder.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
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

    return this.prisma.folder.update({
      where: { id },
      data: { ...dto },
    });
  }

  async delete(userId: string, id: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder) throw new NotFoundException('Folder not found');

    if (folder.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.folder.delete({
      where: { id },
    });

    return { message: 'Folder deleted' };
  }
}
