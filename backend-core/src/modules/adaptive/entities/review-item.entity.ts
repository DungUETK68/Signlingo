import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('review_items')
@Unique(['userId', 'wordSlug'])
export class ReviewItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.reviewItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'word_slug' })
  wordSlug: string;

  @Column({ name: 'word_name' })
  wordName: string;

  // Mức độ ghi nhớ (0..5):
  // 0: Chưa Nhớ (12h) | 1: Nhớ Mong Manh (1d) | 2: Nhớ Chủ Động (3d)
  // 3: Nhớ Tự Tin (7d) | 4: Nhớ Mạnh (14d) | 5: Nhớ Dài Hạn (Hoàn tất, không hẹn lại)
  @Column({ name: 'memory_level', type: 'int', default: 0 })
  memoryLevel: number;

  @Column({ name: 'is_mastered', type: 'boolean', default: false })
  isMastered: boolean;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @Column({ name: 'lapse_count', type: 'int', default: 0 })
  lapseCount: number;

  @Column({ name: 'last_score', type: 'int', default: 0 })
  lastScore: number;

  @Column({ type: 'int', default: 1 })
  interval: number; // số ngày tương đương (lưu tham khảo)

  @Column({ name: 'interval_hours', type: 'int', default: 12 })
  intervalHours: number; // số giờ chờ đến lần ôn tiếp theo (bắt đầu từ 12h)

  @Column({ type: 'int', default: 0 })
  repetition: number; // số lần chọn "Đã nhớ" liên tiếp

  @Column({ type: 'float', default: 2.5 })
  easeFactor: number;

  @Column({ name: 'next_review_date', type: 'varchar', length: 30, nullable: true })
  nextReviewDate: string | null;

  @Column({ name: 'next_review_at', nullable: true })
  nextReviewAt: Date | null;

  @Column({ name: 'last_reviewed_at', nullable: true })
  lastReviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
