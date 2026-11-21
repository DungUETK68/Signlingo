import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CommunityWordStatus {
  VOTING = 'VOTING',       // Đang trong giai đoạn cộng đồng bình chọn
  APPROVED = 'APPROVED',   // Đã được Admin phê duyệt và đưa vào Từ điển
  REJECTED = 'REJECTED',   // Bị Admin từ chối
}

@Entity('community_words')
export class CommunityWord {
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
    default: CommunityWordStatus.VOTING,
  })
  status: CommunityWordStatus;

  @Column({ type: 'int', default: 0 })
  upvotes: number; // Số lượt ủng hộ

  @Column({ type: 'int', default: 0 })
  downvotes: number; // Số lượt không ủng hộ

  @Column({ name: 'total_votes', type: 'int', default: 0 })
  totalVotes: number; // Tổng số lượt đánh giá

  @Column({ name: 'support_rate', type: 'float', default: 0 })
  supportRate: number; // Tỉ lệ ủng hộ (%) = (upvotes / totalVotes) * 100

  @Column({ name: 'admin_feedback', type: 'text', nullable: true })
  adminFeedback: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'author_name', nullable: true })
  authorName: string;

  @Column({ name: 'author_email', nullable: true })
  authorEmail: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
