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
import { Lesson } from '../../dictionary/entities/lesson.entity';

@Entity('user_progress')
@Unique(['userId', 'lessonId'])
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.progressList, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.progressList, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'int', default: 1 })
  attempts: number;

  @Column({ name: 'last_studied_at', nullable: true })
  lastStudiedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
