import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ContributionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('word_contributions')
export class WordContribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  word: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ default: 'greeting' })
  topic: string;

  @Column({ name: 'topic_label', nullable: true, default: 'Chào hỏi & Giao tiếp' })
  topicLabel: string;

  @Column({ default: 'Toàn quốc' })
  dialect: string; // 'Toàn quốc' | 'Miền Bắc' | 'Miền Trung' | 'Miền Nam'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'Dễ' })
  difficulty: string; // 'Dễ' | 'Trung bình' | 'Khó'

  @Column({ default: '3 phút' })
  duration: string;

  @Column({ name: 'hand_shape', nullable: true })
  handShape: string;

  @Column({ nullable: true })
  movement: string;

  @Column({ name: 'video_front', type: 'text', nullable: true })
  videoFront: string;

  @Column({ name: 'video_side', type: 'text', nullable: true })
  videoSide: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ContributionStatus.PENDING,
  })
  status: ContributionStatus;

  @Column({ name: 'admin_feedback', type: 'text', nullable: true })
  adminFeedback: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'contributor_name', nullable: true })
  contributorName: string;

  @Column({ name: 'contributor_email', nullable: true })
  contributorEmail: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
