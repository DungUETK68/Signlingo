import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { LogPracticeDto, CompleteLessonDto } from './dto/progress.dto';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Progress & Gamification (Tiến trình & Điểm số)')
@Controller('api/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @ApiOperation({ summary: 'Ghi nhận lịch sử luyện tập cử chỉ (Camera, Thử thách 5s, Luyện câu)' })
  @UseGuards(OptionalJwtAuthGuard)
  @Post('practice-log')
  logPractice(@CurrentUser() user: User | null, @Body() dto: LogPracticeDto) {
    return this.progressService.logPractice(user?.id || null, dto);
  }

  @ApiOperation({ summary: 'Hoàn thành bài học, cập nhật tiến độ và thưởng XP' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('complete-lesson')
  completeLesson(@CurrentUser() user: User, @Body() dto: CompleteLessonDto) {
    return this.progressService.completeLesson(user.id, dto);
  }

  @ApiOperation({ summary: 'Lấy danh sách các bài học đã hoàn thành của người dùng' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-lessons')
  getUserProgress(@CurrentUser() user: User) {
    return this.progressService.getUserProgress(user.id);
  }

  @ApiOperation({ summary: 'Lấy lịch sử luyện tập gần đây của người dùng' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-history')
  getPracticeHistory(@CurrentUser() user: User, @Query('limit') limit?: number) {
    return this.progressService.getPracticeHistory(user.id, limit ? Number(limit) : 20);
  }

  @ApiOperation({ summary: 'Lấy bảng xếp hạng học viên theo XP (Leaderboard)' })
  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: number) {
    return this.progressService.getLeaderboard(limit ? Number(limit) : 20);
  }
}

