import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum VoteType {
  UP = 'UP',       // Ủng hộ
  DOWN = 'DOWN',   // Không ủng hộ
}

@Entity('community_votes')
@Index(['wordId', 'userId'], { unique: true }) // Mỗi người dùng chỉ vote 1 lần cho mỗi từ
export class CommunityVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'word_id' })
  wordId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    name: 'vote_type',
    type: 'varchar',
    length: 10,
  })
  voteType: VoteType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
