import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface SentenceWordItem {
  id: number;
  name: string;
  slug: string;
  role: string;
  video: string;
  hint: string;
}

@Entity('sentences')
export class Sentence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  meaning: string;

  @Column({ default: 'SOV (Chủ - Bổ - Động)' })
  structure: string;

  @Column({ default: 'Giao tiếp hàng ngày' })
  category: string;

  @Column({ default: 'Dễ' })
  difficulty: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ type: 'simple-json' })
  words: SentenceWordItem[];

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

