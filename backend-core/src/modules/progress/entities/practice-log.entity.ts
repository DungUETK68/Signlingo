import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('practice_logs')
export class PracticeLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.practiceLogs, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'word_slug' })
  wordSlug: string;

  @Column({ name: 'word_name' })
  wordName: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ name: 'is_passed', default: false })
  isPassed: boolean;

  @Column({ name: 'bad_joints', type: 'simple-json', nullable: true })
  badJoints: number[];

  @Column({ default: 'camera' })
  mode: string; // 'camera' | '5s_challenge' | 'sentence'

  @Column({ name: 'duration_seconds', type: 'float', default: 3.0 })
  durationSeconds: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

