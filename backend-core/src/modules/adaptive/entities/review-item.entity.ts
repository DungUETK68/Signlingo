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

  @Column({ type: 'int', default: 1 })
  interval: number; // số ngày đến lần ôn tiếp theo

  @Column({ type: 'int', default: 0 })
  repetition: number; // số lần ôn thành công liên tiếp

  @Column({ type: 'float', default: 2.5 })
  easeFactor: number; // hệ số dễ/khó của thuật toán SM-2

  @Column({ name: 'next_review_date', type: 'varchar', length: 20 })
  nextReviewDate: string; // YYYY-MM-DD

  @Column({ name: 'last_reviewed_at', nullable: true })
  lastReviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
