import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdaptiveService } from './adaptive.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { SubmitReviewResultDto, SyncSavedWordsDto } from './dto/adaptive-srs.dto';

@ApiTags('Adaptive & SRS (Lộ trình thích ứng & Ôn tập ngắt quãng)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/adaptive')
export class AdaptiveController {
  constructor(private readonly adaptiveService: AdaptiveService) {}

  @ApiOperation({ summary: 'Lấy các từ vựng đến hạn cần ôn tập (chu kỳ từ 12h đến 14 ngày)' })
  @Get('review-queue')
  getDueReviewItems(@CurrentUser() user: User) {
    return this.adaptiveService.getDueReviewItems(user.id);
  }

  @ApiOperation({ summary: 'Lấy thống kê Phân bổ ghi nhớ 6 mức độ & toàn bộ danh sách từ SRS' })
  @Get('memory-overview')
  getMemoryOverview(@CurrentUser() user: User) {
    return this.adaptiveService.getMemoryOverview(user.id);
  }

  @ApiOperation({ summary: 'Đồng bộ danh sách từ đã lưu vào hệ thống Spaced Repetition' })
  @Post('sync-words')
  syncSavedWords(@CurrentUser() user: User, @Body() dto: SyncSavedWordsDto) {
    return this.adaptiveService.syncSavedWords(user.id, dto);
  }

  @ApiOperation({ summary: 'Ghi nhận lựa chọn sau khi ôn tập Đạt ("Đã nhớ" tăng cấp / "Sẽ ôn lại" về 12h)' })
  @Post('review-result')
  submitReviewResult(@CurrentUser() user: User, @Body() dto: SubmitReviewResultDto) {
    return this.adaptiveService.submitReviewResult(user.id, dto);
  }

  @ApiOperation({ summary: 'Lấy khuyến nghị học tập cá nhân hóa & từ yếu cần củng cố' })
  @Get('recommendations')
  getAdaptiveRecommendations(@CurrentUser() user: User) {
    return this.adaptiveService.getAdaptiveRecommendations(user.id);
  }
}
