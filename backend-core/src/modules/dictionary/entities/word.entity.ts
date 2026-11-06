import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Topic } from './topic.entity';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  meaning: string;

  @Column({ default: 'Từ vựng thông dụng' })
  category: string;

  @Column({ nullable: true })
  phonetic: string;

  @Column({ name: 'topic_id', nullable: true })
  topicId: string;

  @ManyToOne(() => Topic, (topic) => topic.words, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column({ name: 'video_url', default: '/chao.mp4' })
  videoUrl: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'benchmark_file', nullable: true })
  benchmarkFile: string;

  @Column({ default: 'Dễ' })
  difficulty: string; // 'Dễ' | 'Trung bình' | 'Khó'

  @Column({ name: 'usage_tips', type: 'text', nullable: true })
  usageTips: string;

  @Column({ type: 'simple-json', nullable: true })
  examples: string[];

  @Column({ name: 'is_custom', default: false })
  isCustom: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

