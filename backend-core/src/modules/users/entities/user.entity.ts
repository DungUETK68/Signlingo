import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserProgress } from '../../progress/entities/user-progress.entity';
import { PracticeLog } from '../../progress/entities/practice-log.entity';
import { ReviewItem } from '../../adaptive/entities/review-item.entity';

export enum UserRole {
  LEARNER = 'LEARNER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name', default: 'Học viên Signlingo' })
  fullName: string;

  @Column({ type: 'varchar', default: UserRole.LEARNER })
  role: UserRole;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ type: 'int', default: 0 })
  xp: number;

  @Column({ type: 'int', default: 1 })
  streak: number;

  @Column({ name: 'last_active_date', type: 'varchar', length: 20, nullable: true })
  lastActiveDate: string;

  @Column({ type: 'int', default: 5 })
  hearts: number;

  @Column({ type: 'int', default: 100 })
  gems: number;

  @Column({ name: 'learning_level', default: 'beginner' })
  learningLevel: string; // 'beginner' | 'elementary' | 'intermediate'

  @Column({ name: 'daily_goal_minutes', type: 'int', default: 15 })
  dailyGoalMinutes: number;

  @Column({ name: 'priority_topic', default: 'greeting' })
  priorityTopic: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserProgress, (progress) => progress.user)
  progressList: UserProgress[];

  @OneToMany(() => PracticeLog, (log) => log.user)
  practiceLogs: PracticeLog[];

  @OneToMany(() => ReviewItem, (item) => item.user)
  reviewItems: ReviewItem[];
}

