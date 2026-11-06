import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SentencesService } from './sentences.service';

@ApiTags('Sentences (Câu thường gặp VSL)')
@Controller('api/sentences')
export class SentencesController {
  constructor(private readonly sentencesService: SentencesService) {}

  @ApiOperation({ summary: 'Lấy danh sách các câu giao tiếp chuẩn ngữ pháp VSL' })
  @Get()
  findAllSentences(@Query('category') category?: string) {
    return this.sentencesService.findAllSentences(category);
  }

  @ApiOperation({ summary: 'Lấy chi tiết một câu theo slug hoặc id' })
  @Get(':slug')
  findSentenceBySlug(@Param('slug') slug: string) {
    return this.sentencesService.findSentenceBySlug(slug);
  }
}

