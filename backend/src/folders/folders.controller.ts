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
import { FoldersService } from './folders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Folders')
@ApiBearerAuth('JWT')
@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private foldersService: FoldersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new folder' })
  @ApiBody({ type: CreateFolderDto })
  create(@Req() req: AuthRequest, @Body() createFolderDto: CreateFolderDto) {
    return this.foldersService.create(req.user.id, createFolderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user folders' })
  findAll(
    @Req() req: AuthRequest,
    @Query('parentId') parentId?: string,
    @Query('view') view?: 'all' | 'favorites' | 'archive' | 'trash',
    @Query('space') space?: 'private' | 'shared',
  ) {
    return this.foldersService.findAll(req.user.id, {
      parentId,
      view,
      space: space || 'private',
    });
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'Get item from folders' })
  findNotes(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.foldersService.findFolderNotes(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.foldersService.update(req.user.id, id, updateFolderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  delete(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.foldersService.delete(req.user.id, id);
  }
}
