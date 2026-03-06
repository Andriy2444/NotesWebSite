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
  findAll(@Req() req: AuthRequest) {
    return this.notesService.findAll(req.user.id);
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

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete note by id' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  softDelete(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notesService.softDelete(req.user.id, id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Hard delete note by id' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  hardDelete(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notesService.hardDelete(req.user.id, id);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get notes for calendar' })
  calendar(@Req() req: AuthRequest) {
    return this.notesService.calendar(req.user.id);
  }
}
