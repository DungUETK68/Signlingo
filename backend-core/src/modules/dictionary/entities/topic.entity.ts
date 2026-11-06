import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { Word } from './word.entity';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: '📚' })
  icon: string;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Lesson, (lesson) => lesson.topic, { cascade: true })
  lessons: Lesson[];

  @OneToMany(() => Word, (word) => word.topic)
  words: Word[];
}

