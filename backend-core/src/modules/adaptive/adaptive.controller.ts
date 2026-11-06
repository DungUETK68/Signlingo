import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdaptiveService } from './adaptive.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Adaptive & SRS (Lộ trình thích ứng & Ôn tập ngắt quãng)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/adaptive')
export class AdaptiveController {
  constructor(private readonly adaptiveService: AdaptiveService) {}

  @ApiOperation({ summary: 'Lấy các từ vựng đến hạn cần ôn tập hôm nay (Spaced Repetition System)' })
  @Get('review-queue')
  getDueReviewItems(@CurrentUser() user: User) {
    return this.adaptiveService.getDueReviewItems(user.id);
  }

  @ApiOperation({ summary: 'Lấy khuyến nghị học tập cá nhân hóa & từ yếu cần củng cố' })
  @Get('recommendations')
  getAdaptiveRecommendations(@CurrentUser() user: User) {
    return this.adaptiveService.getAdaptiveRecommendations(user.id);
  }
}

