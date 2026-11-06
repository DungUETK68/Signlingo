import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ReviewItem } from './entities/review-item.entity';
import { PracticeLog } from '../progress/entities/practice-log.entity';
import { User } from '../users/entities/user.entity';
import { Word } from '../dictionary/entities/word.entity';

@Injectable()
export class AdaptiveService {
  constructor(
    @InjectRepository(ReviewItem)
    private readonly reviewItemRepository: Repository<ReviewItem>,
    @InjectRepository(PracticeLog)
    private readonly practiceLogRepository: Repository<PracticeLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
  ) {}

  async getDueReviewItems(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const items = await this.reviewItemRepository.find({
      where: {
        userId,
        nextReviewDate: LessThanOrEqual(today),
      },
      order: { nextReviewDate: 'ASC' },
    });

    // Bổ sung thông tin chi tiết từ vựng
    const enriched = await Promise.all(
      items.map(async (item) => {
        const word = await this.wordRepository.findOne({
          where: [{ slug: item.wordSlug }, { name: item.wordName }],
        });
        return {
          ...item,
          videoUrl: word?.videoUrl || '/chao.mp4',
          thumbnailUrl: word?.thumbnailUrl || null,
          category: word?.category || 'Từ vựng cần ôn',
          meaning: word?.meaning || '',
        };
      }),
    );

    return enriched;
  }

  async getAdaptiveRecommendations(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // 1. Phân tích các từ có điểm thấp trong 30 lần luyện tập gần nhất
    const recentLogs = await this.practiceLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 30,
    });

    const statsByWord: Record<string, { count: number; totalScore: number; failCount: number; name: string }> = {};
    recentLogs.forEach((log) => {
      if (!statsByWord[log.wordSlug]) {
        statsByWord[log.wordSlug] = { count: 0, totalScore: 0, failCount: 0, name: log.wordName };
      }
      statsByWord[log.wordSlug].count += 1;
      statsByWord[log.wordSlug].totalScore += log.score;
      if (!log.isPassed) statsByWord[log.wordSlug].failCount += 1;
    });

    const weakWords = Object.entries(statsByWord)
      .filter(([_, stat]) => stat.totalScore / stat.count < 75 || stat.failCount > 0)
      .map(([slug, stat]) => ({
        slug,
        name: stat.name,
        avgScore: Math.round(stat.totalScore / stat.count),
        attemptCount: stat.count,
        recommendedAction: 'Cần luyện tập lại các góc gập khớp ngón tay',
      }));

    // 2. Lấy số lượng từ cần ôn tập hôm nay
    const today = new Date().toISOString().split('T')[0];
    const dueCount = await this.reviewItemRepository.count({
      where: {
        userId,
        nextReviewDate: LessThanOrEqual(today),
      },
    });

    return {
      learningLevel: user.learningLevel,
      dailyGoalMinutes: user.dailyGoalMinutes,
      priorityTopic: user.priorityTopic,
      weakWords,
      dueReviewCount: dueCount,
      advice:
        weakWords.length > 0
          ? `Hệ thống ghi nhận bạn đang gặp khó khăn ở ${weakWords.length} từ. Hãy ôn lại trước khi chuyển sang bài mới!`
          : 'Phong độ của bạn rất tốt! Hãy tiếp tục duy trì chuỗi học tập.',
    };
  }
}

