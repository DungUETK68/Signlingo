import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Topic } from './topic.entity';
import { UserProgress } from '../../progress/entities/user-progress.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'topic_id' })
  topicId: string;

  @ManyToOne(() => Topic, (topic) => topic.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column()
  title: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: '5 phút' })
  duration: string;

  @Column({ default: 'Cơ bản' })
  level: string;

  @Column({ name: 'video_url', nullable: true })
  videoUrl: string;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserProgress, (progress) => progress.lesson)
  progressList: UserProgress[];
}

