import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags('Notes')
@ApiBearerAuth('JWT')
@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new note' })
  @ApiBody({ type: CreateNoteDto })
  create(@Req() req: AuthRequest, @Body() dto: CreateNoteDto) {
    return this.notesService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes' })
  findAll(
    @Req() req: AuthRequest,
    @Query('folderId') folderId?: string,
    @Query('view') view?: 'all' | 'favorites' | 'archive' | 'trash',
    @Query('space') space?: 'private' | 'shared',
  ) {
    return this.notesService.findAll(req.user.id, {
      folderId,
      view,
      space: space || 'private',
    });
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get notes for calendar' })
  calendar(
    @Req() req: AuthRequest,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.notesService.calendar(req.user.id, +year, +month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by id' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update note by id' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(req.user.id, id, dto);
  }

  @Get(':id/versions')
  async getVersions(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notesService.getVersions(req.user.id, id);
  }

  @Post(':id/versions/:versionId/restore')
  @ApiOperation({ summary: 'Restore note to a specific version' })
  restoreVersion(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.notesService.restoreVersion(req.user.id, id, versionId);
  }

  @Delete(':id/versions/:versionId')
  @ApiOperation({ summary: 'Delete a specific version' })
  deleteVersion(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.notesService.deleteVersion(req.user.id, id, versionId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete note' })
  delete(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notesService.delete(req.user.id, id);
  }
}
