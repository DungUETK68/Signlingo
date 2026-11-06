import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Topic } from '../dictionary/entities/topic.entity';
import { Lesson } from '../dictionary/entities/lesson.entity';
import { Word } from '../dictionary/entities/word.entity';
import { Sentence } from '../sentences/entities/sentence.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Topic, Lesson, Word, Sentence])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}

