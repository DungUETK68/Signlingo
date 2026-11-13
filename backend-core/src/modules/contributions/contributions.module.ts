import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordContribution } from './entities/word-contribution.entity';
import { Word } from '../dictionary/entities/word.entity';
import { Topic } from '../dictionary/entities/topic.entity';
import { Lesson } from '../dictionary/entities/lesson.entity';
import { ContributionsService } from './contributions.service';
import { ContributionsController } from './contributions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WordContribution,
      Word,
      Topic,
      Lesson,
    ]),
  ],
  controllers: [ContributionsController],
  providers: [ContributionsService],
  exports: [ContributionsService],
})
export class ContributionsModule {}
