import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShareItemDto } from './dto/share-item.dto';

@Injectable()
export class ShareService {
  constructor(private prisma: PrismaService) {}

  async shareNote(ownerId: string, noteId: string, dto: ShareItemDto) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== ownerId) {
      throw new ForbiddenException(
        'You are not the owner of this note, so you cannot share it',
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!targetUser) {
      throw new NotFoundException(`User with email ${dto.email} not found`);
    }

    if (targetUser.id === ownerId) {
      throw new BadRequestException('You cannot share a note with yourself');
    }

    return this.prisma.$transaction(async (tx) => {
      if (note.spaceType === 'PRIVATE') {
        await tx.note.update({
          where: { id: noteId },
          data: { spaceType: 'SHARED' },
        });
      }

      return tx.sharedNote.upsert({
        where: {
          noteId_userId: { noteId, userId: targetUser.id },
        },
        update: { role: dto.role },
        create: {
          noteId,
          userId: targetUser.id,
          role: dto.role,
        },
        include: {
          user: { select: { id: true, username: true, email: true } },
        },
      });
    });
  }

  async shareFolder(ownerId: string, folderId: string, dto: ShareItemDto) {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (folder.userId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this folder');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!targetUser) {
      throw new NotFoundException(`User with email ${dto.email} not found`);
    }

    if (targetUser.id === ownerId) {
      throw new BadRequestException('You cannot share a folder with yourself');
    }

    return this.prisma.$transaction(async (tx) => {
      if (folder.spaceType === 'PRIVATE') {
        await tx.folder.update({
          where: { id: folderId },
          data: { spaceType: 'SHARED' },
        });

        await tx.note.updateMany({
          where: { folderId },
          data: { spaceType: 'SHARED' },
        });
      }

      return tx.sharedFolder.upsert({
        where: {
          folderId_userId: { folderId, userId: targetUser.id },
        },
        update: { role: dto.role },
        create: {
          folderId,
          userId: targetUser.id,
          role: dto.role,
        },
        include: {
          user: { select: { id: true, username: true, email: true } },
        },
      });
    });
  }

  async revokeNoteAccess(
    ownerId: string,
    noteId: string,
    targetUserId: string,
  ) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== ownerId && targetUserId !== ownerId) {
      throw new ForbiddenException(
        'You do not have permission to manage access to this note',
      );
    }

    const shareExists = await this.prisma.sharedNote.findUnique({
      where: { noteId_userId: { noteId, userId: targetUserId } },
    });

    if (shareExists) {
      await this.prisma.sharedNote.delete({
        where: { noteId_userId: { noteId, userId: targetUserId } },
      });
    }

    const remainingShares = await this.prisma.sharedNote.count({
      where: { noteId },
    });

    if (remainingShares === 0 && note.folderId === null) {
      await this.prisma.note.update({
        where: { id: noteId },
        data: { spaceType: 'PRIVATE' },
      });
    }

    return { success: true };
  }

  async revokeFolderAccess(
    ownerId: string,
    folderId: string,
    targetUserId: string,
  ) {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (folder.userId !== ownerId && targetUserId !== ownerId) {
      throw new ForbiddenException(
        'You do not have permission to manage access to this folder',
      );
    }

    const shareExists = await this.prisma.sharedFolder.findUnique({
      where: { folderId_userId: { folderId, userId: targetUserId } },
    });

    if (shareExists) {
      await this.prisma.sharedFolder.delete({
        where: { folderId_userId: { folderId, userId: targetUserId } },
      });
    }

    const remainingShares = await this.prisma.sharedFolder.count({
      where: { folderId },
    });

    if (remainingShares === 0) {
      await this.prisma.folder.update({
        where: { id: folderId },
        data: { spaceType: 'PRIVATE' },
      });

      await this.prisma.note.updateMany({
        where: {
          folderId,
          sharedWith: { none: {} },
        },
        data: { spaceType: 'PRIVATE' },
      });
    }

    return { success: true };
  }
}
