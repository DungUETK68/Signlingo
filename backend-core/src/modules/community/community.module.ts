import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityWord } from './entities/community-word.entity';
import { CommunityVote } from './entities/community-vote.entity';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { Word } from '../dictionary/entities/word.entity';
import { Lesson } from '../dictionary/entities/lesson.entity';
import { Topic } from '../dictionary/entities/topic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityWord,
      CommunityVote,
      Word,
      Lesson,
      Topic,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
