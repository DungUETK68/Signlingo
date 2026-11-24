import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewItem } from './entities/review-item.entity';
import { PracticeLog } from '../progress/entities/practice-log.entity';
import { User } from '../users/entities/user.entity';
import { Word } from '../dictionary/entities/word.entity';
import { SubmitReviewResultDto, SyncSavedWordsDto } from './dto/adaptive-srs.dto';

// Khoảng cách thời gian chờ (tính bằng giờ) cho 6 mức độ ghi nhớ:
// 0: Chưa Nhớ (12h) -> 1: Nhớ Mong Manh (24h = 1 ngày) -> 2: Nhớ Chủ Động (72h = 3 ngày)
// -> 3: Nhớ Tự Tin (168h = 7 ngày) -> 4: Nhớ Mạnh (336h = 14 ngày) -> 5: Nhớ Dài Hạn (null = hoàn tất)
export const MEMORY_LEVEL_HOURS: Record<number, number | null> = {
  0: 12,
  1: 24,
  2: 72,
  3: 168,
  4: 336,
  5: null,
};

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

  private isItemDue(item: ReviewItem, nowMs = Date.now()): boolean {
    if (item.isMastered || item.memoryLevel >= 5) {
      return false;
    }
    if (item.nextReviewAt) {
      return new Date(item.nextReviewAt).getTime() <= nowMs;
    }
    if (item.nextReviewDate) {
      const today = new Date(nowMs).toISOString().split('T')[0];
      return item.nextReviewDate <= today;
    }
    return true;
  }

  private async enrichItems(items: ReviewItem[]) {
    return Promise.all(
      items.map(async (item) => {
        const word = await this.wordRepository.findOne({
          where: [{ slug: item.wordSlug }, { name: item.wordName }],
        });
        return {
          ...item,
          videoUrl: word?.videoUrl || `/vsl400_videos/${item.wordSlug}_front.mp4`,
          videoSideUrl: word?.videoLeft || `/vsl400_videos/${item.wordSlug}_left.mp4`,
          thumbnailUrl: word?.thumbnailUrl || null,
          category: word?.category || 'Từ vựng cần ôn',
          meaning: word?.meaning || '',
          usageTips: word?.usageTips || '',
        };
      }),
    );
  }

  async getDueReviewItems(userId: string) {
    const allItems = await this.reviewItemRepository.find({
      where: { userId },
      order: { updatedAt: 'ASC' },
    });

    const nowMs = Date.now();
    const dueItems = allItems
      .filter((item) => this.isItemDue(item, nowMs))
      .sort((a, b) => {
        const ta = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0;
        const tb = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0;
        return ta - tb;
      });

    return this.enrichItems(dueItems);
  }

  async getMemoryOverview(userId: string) {
    const allItems = await this.reviewItemRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    const nowMs = Date.now();
    const enriched = await this.enrichItems(allItems);

    const levelCounts = [0, 0, 0, 0, 0, 0];
    let startedCount = 0;
    let strongCount = 0;
    let hardCount = 0;
    let dueCount = 0;

    enriched.forEach((item) => {
      const lvl = Math.min(5, Math.max(0, item.memoryLevel || 0));
      levelCounts[lvl] += 1;
      if ((item.reviewCount || 0) > 0 || lvl > 0) {
        startedCount += 1;
      }
      if (lvl >= 3) {
        strongCount += 1;
      }
      if ((item.lapseCount || 0) > 0) {
        hardCount += 1;
      }
      if (this.isItemDue(item, nowMs)) {
        dueCount += 1;
      }
    });

    return {
      totalWords: enriched.length,
      startedCount,
      strongCount,
      hardCount,
      dueCount,
      levelCounts,
      items: enriched,
    };
  }

  async syncSavedWords(userId: string, dto: SyncSavedWordsDto) {
    const now = new Date();
    for (const w of dto.words || []) {
      const cleanSlug = w.wordSlug.trim().toLowerCase();
      if (!cleanSlug) continue;

      const existing = await this.reviewItemRepository.findOne({
        where: { userId, wordSlug: cleanSlug },
      });

      if (!existing) {
        const baseTime = w.savedAt ? new Date(w.savedAt) : now;
        const baseMs = isNaN(baseTime.getTime()) ? now.getTime() : baseTime.getTime();
        // Bắt đầu nhắc ôn từ sau 12 tiếng kể từ lúc lưu/học từ mới
        const nextAt = new Date(baseMs + 12 * 3600 * 1000);

        const created = this.reviewItemRepository.create({
          userId,
          wordSlug: cleanSlug,
          wordName: w.wordName.trim(),
          memoryLevel: 0,
          isMastered: false,
          reviewCount: 0,
          lapseCount: 0,
          lastScore: 0,
          interval: 0,
          intervalHours: 12,
          repetition: 0,
          easeFactor: 2.5,
          nextReviewDate: nextAt.toISOString().split('T')[0],
          nextReviewAt: nextAt,
        });
        await this.reviewItemRepository.save(created);
      }
    }

    return this.getMemoryOverview(userId);
  }

  async submitReviewResult(userId: string, dto: SubmitReviewResultDto) {
    const cleanSlug = dto.wordSlug.trim().toLowerCase();
    let item = await this.reviewItemRepository.findOne({
      where: { userId, wordSlug: cleanSlug },
    });

    const now = new Date();
    if (!item) {
      item = this.reviewItemRepository.create({
        userId,
        wordSlug: cleanSlug,
        wordName: dto.wordName.trim(),
        memoryLevel: 0,
        isMastered: false,
        reviewCount: 0,
        lapseCount: 0,
        lastScore: 0,
        interval: 1,
        intervalHours: 12,
        repetition: 0,
        easeFactor: 2.5,
      });
    }

    item.wordName = dto.wordName.trim() || item.wordName;
    item.reviewCount = (item.reviewCount || 0) + 1;
    item.lastReviewedAt = now;
    if (typeof dto.score === 'number') {
      item.lastScore = Math.round(dto.score);
    }
    if (dto.failedAttempts && dto.failedAttempts > 0) {
      item.lapseCount = (item.lapseCount || 0) + 1;
    }

    if (dto.choice === 'remembered') {
      const nextLevel = Math.min(5, (item.memoryLevel || 0) + 1);
      item.memoryLevel = nextLevel;
      item.repetition = (item.repetition || 0) + 1;

      if (nextLevel >= 5) {
        // Đạt mức "Nhớ Dài Hạn" -> Không còn thời gian chờ ôn lại nữa
        item.isMastered = true;
        item.intervalHours = 0;
        item.interval = 0;
        item.nextReviewAt = null;
        item.nextReviewDate = null;
      } else {
        item.isMastered = false;
        const waitHours = MEMORY_LEVEL_HOURS[nextLevel] ?? 24;
        item.intervalHours = waitHours;
        item.interval = Math.max(1, Math.round(waitHours / 24));
        const nextAt = new Date(now.getTime() + waitHours * 3600 * 1000);
        item.nextReviewAt = nextAt;
        item.nextReviewDate = nextAt.toISOString().split('T')[0];
      }
    } else {
      // Chọn "Sẽ ôn lại" -> Về mức đầu tiên "Chưa Nhớ" (0) và hẹn nhắc lại sau 12h
      item.memoryLevel = 0;
      item.isMastered = false;
      item.repetition = 0;
      item.lapseCount = (item.lapseCount || 0) + 1;
      item.intervalHours = 12;
      item.interval = 0;
      const nextAt = new Date(now.getTime() + 12 * 3600 * 1000);
      item.nextReviewAt = nextAt;
      item.nextReviewDate = nextAt.toISOString().split('T')[0];
    }

    const saved = await this.reviewItemRepository.save(item);

    // Thưởng XP khích lệ mỗi lần hoàn thành 1 từ ôn tập ngắt quãng
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.xp += dto.choice === 'remembered' ? 50 : 20;
      await this.userRepository.save(user);
    }

    return {
      message:
        dto.choice === 'remembered'
          ? 'Đã nâng mức độ ghi nhớ thành công!'
          : 'Đã đặt lịch nhắc ôn lại từ này sau 12 giờ.',
      item: saved,
    };
  }

  async getAdaptiveRecommendations(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

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

    const allItems = await this.reviewItemRepository.find({ where: { userId } });
    const nowMs = Date.now();
    const dueCount = allItems.filter((item) => this.isItemDue(item, nowMs)).length;

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
