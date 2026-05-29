import {
  Body,
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShareService } from './share.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { ShareItemDto } from './dto/share-item.dto';

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags('Sharing')
@ApiBearerAuth('JWT')
@Controller('share')
@UseGuards(JwtAuthGuard)
export class ShareController {
  constructor(private shareService: ShareService) {}

  @Post('note/:id')
  @ApiOperation({ summary: 'Share a note with user by email (or update role)' })
  @ApiBody({ type: ShareItemDto })
  shareNote(
    @Req() req: AuthRequest,
    @Param('id') noteId: string,
    @Body() dto: ShareItemDto,
  ) {
    return this.shareService.shareNote(req.user.id, noteId, dto);
  }

  @Post('folder/:id')
  @ApiOperation({
    summary: 'Share a folder with user by email (or update role)',
  })
  @ApiBody({ type: ShareItemDto })
  shareFolder(
    @Req() req: AuthRequest,
    @Param('id') folderId: string,
    @Body() dto: ShareItemDto,
  ) {
    return this.shareService.shareFolder(req.user.id, folderId, dto);
  }

  @Delete('note/:id/:userId')
  @ApiOperation({ summary: 'Revoke user access from a note' })
  revokeNoteAccess(
    @Req() req: AuthRequest,
    @Param('id') noteId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.shareService.revokeNoteAccess(
      req.user.id,
      noteId,
      targetUserId,
    );
  }

  @Delete('folder/:id/:userId')
  @ApiOperation({ summary: 'Revoke user access from a folder' })
  revokeFolderAccess(
    @Req() req: AuthRequest,
    @Param('id') folderId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.shareService.revokeFolderAccess(
      req.user.id,
      folderId,
      targetUserId,
    );
  }
}
