import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Topic } from '../dictionary/entities/topic.entity';
import { Lesson } from '../dictionary/entities/lesson.entity';
import { Word } from '../dictionary/entities/word.entity';
import { Sentence } from '../sentences/entities/sentence.entity';
import { PracticeLog } from '../progress/entities/practice-log.entity';
import { UserProgress } from '../progress/entities/user-progress.entity';
import { ReviewItem } from '../adaptive/entities/review-item.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Topic,
      Lesson,
      Word,
      Sentence,
      PracticeLog,
      UserProgress,
      ReviewItem,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}

