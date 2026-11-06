import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DictionaryService } from './dictionary.service';
import { CreateWordDto } from './dto/create-word.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Dictionary & Topics (Từ điển & Bài học)')
@Controller('api')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @ApiOperation({ summary: 'Lấy danh sách từ điển VSL, hỗ trợ tìm kiếm và lọc theo nhóm' })
  @Get('words')
  findAllWords(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.dictionaryService.findAllWords(search, category);
  }

  @ApiOperation({ summary: 'Lấy chi tiết một từ vựng theo slug' })
  @Get('words/:slug')
  findWordBySlug(@Param('slug') slug: string) {
    return this.dictionaryService.findWordBySlug(slug);
  }

  @ApiOperation({ summary: 'Lấy danh sách chủ đề (Topics) và các bài học (Lessons)' })
  @Get('topics')
  findAllTopics() {
    return this.dictionaryService.findAllTopicsWithLessons();
  }

  @ApiOperation({ summary: 'Admin thêm từ mới vào từ điển' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('words')
  createWord(@Body() dto: CreateWordDto) {
    return this.dictionaryService.createWord(dto);
  }

  @ApiOperation({ summary: 'Admin xóa từ vựng' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('words/:id')
  deleteWord(@Param('id') id: string) {
    return this.dictionaryService.deleteWord(id);
  }
}

