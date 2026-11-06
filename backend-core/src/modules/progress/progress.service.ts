import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeLog } from './entities/practice-log.entity';
import { UserProgress } from './entities/user-progress.entity';
import { User } from '../users/entities/user.entity';
import { ReviewItem } from '../adaptive/entities/review-item.entity';
import { LogPracticeDto, CompleteLessonDto } from './dto/progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(PracticeLog)
    private readonly practiceLogRepository: Repository<PracticeLog>,
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ReviewItem)
    private readonly reviewItemRepository: Repository<ReviewItem>,
  ) {}

  async logPractice(userId: string | null, dto: LogPracticeDto) {
    const log = this.practiceLogRepository.create({
      userId: userId || undefined,
      wordSlug: dto.wordSlug,
      wordName: dto.wordName,
      score: dto.score,
      isPassed: dto.isPassed,
      badJoints: dto.badJoints || [],
      mode: dto.mode || 'camera',
      durationSeconds: dto.durationSeconds || 3.0,
    });
    const savedLog = await this.practiceLogRepository.save(log);

    let xpGained = 0;
    let streakCount = 1;

    if (userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        // Cộng điểm XP
        xpGained = dto.isPassed ? 100 : 30;
        user.xp += xpGained;

        // Cập nhật streak
        const today = new Date().toISOString().split('T')[0];
        if (user.lastActiveDate !== today) {
          if (user.lastActiveDate) {
            const lastDate = new Date(user.lastActiveDate);
            const diffDays = Math.round(
              (new Date(today).getTime() - lastDate.getTime()) / (1000 * 3600 * 24),
            );
            if (diffDays === 1) {
              user.streak += 1;
            } else if (diffDays > 1) {
              user.streak = 1;
            }
          } else {
            user.streak = 1;
          }
          user.lastActiveDate = today;
        }
        streakCount = user.streak;
        await this.userRepository.save(user);

        // Tự động đưa vào danh sách ôn tập Spaced Repetition (SRS)
        await this.syncToReviewSRS(userId, dto.wordSlug, dto.wordName, dto.isPassed, dto.score);
      }
    }

    return {
      message: 'Ghi nhận kết quả luyện tập thành công',
      log: savedLog,
      xpGained,
      streak: streakCount,
    };
  }

  async completeLesson(userId: string, dto: CompleteLessonDto) {
    let progress = await this.userProgressRepository.findOne({
      where: { userId, lessonId: dto.lessonId },
    });

    const isFirstTime = !progress || !progress.completed;

    if (!progress) {
      progress = this.userProgressRepository.create({
        userId,
        lessonId: dto.lessonId,
        completed: true,
        score: dto.score,
        attempts: 1,
        lastStudiedAt: new Date(),
      });
    } else {
      progress.completed = true;
      progress.score = Math.max(progress.score, dto.score);
      progress.attempts += 1;
      progress.lastStudiedAt = new Date();
    }

    await this.userProgressRepository.save(progress);

    // Thưởng XP khi hoàn thành bài học
    const bonusXp = isFirstTime ? 150 : 50;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.xp += bonusXp;
      await this.userRepository.save(user);
    }

    return {
      message: 'Hoàn thành bài học thành công',
      progress,
      bonusXp,
      totalXp: user?.xp ?? 0,
    };
  }

  async getUserProgress(userId: string) {
    return this.userProgressRepository.find({
      where: { userId },
      relations: ['lesson'],
      order: { lastStudiedAt: 'DESC' },
    });
  }

  async getPracticeHistory(userId: string, limit = 20) {
    return this.practiceLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getLeaderboard(limit = 20) {
    const users = await this.userRepository.find({
      order: { xp: 'DESC' },
      take: limit,
      select: ['id', 'fullName', 'xp', 'streak', 'avatarUrl', 'learningLevel'],
    });

    return users.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      fullName: u.fullName,
      xp: u.xp,
      streak: u.streak,
      avatarUrl: u.avatarUrl,
      learningLevel: u.learningLevel,
      league: index < 3 ? 'Kim Cương' : index < 10 ? 'Vàng' : 'Bạc',
    }));
  }

  private async syncToReviewSRS(
    userId: string,
    wordSlug: string,
    wordName: string,
    isPassed: boolean,
    score: number,
  ) {
    let item = await this.reviewItemRepository.findOne({
      where: { userId, wordSlug },
    });

    const today = new Date();

    if (!item) {
      // Từ mới được luyện tập lần đầu
      const interval = isPassed ? 1 : 0;
      const nextDate = new Date(today.getTime() + interval * 86400000);

      item = this.reviewItemRepository.create({
        userId,
        wordSlug,
        wordName,
        interval,
        repetition: isPassed ? 1 : 0,
        easeFactor: 2.5,
        nextReviewDate: nextDate.toISOString().split('T')[0],
        lastReviewedAt: today,
      });
    } else {
      // Cập nhật thuật toán SM-2 rút gọn
      if (isPassed && score >= 80) {
        if (item.repetition === 0) {
          item.interval = 1;
        } else if (item.repetition === 1) {
          item.interval = 3;
        } else {
          item.interval = Math.round(item.interval * item.easeFactor);
        }
        item.repetition += 1;
        item.easeFactor = Math.max(1.3, item.easeFactor + 0.1);
      } else {
        // Nếu làm sai hoặc điểm thấp -> reset chu kỳ
        item.repetition = 0;
        item.interval = 1;
        item.easeFactor = Math.max(1.3, item.easeFactor - 0.2);
      }

      const nextDate = new Date(today.getTime() + item.interval * 86400000);
      item.nextReviewDate = nextDate.toISOString().split('T')[0];
      item.lastReviewedAt = today;
    }

    await this.reviewItemRepository.save(item);
  }
}

