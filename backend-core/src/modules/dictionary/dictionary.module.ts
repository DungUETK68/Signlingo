import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Word } from './entities/word.entity';
import { Topic } from './entities/topic.entity';
import { Lesson } from './entities/lesson.entity';
import { DictionaryService } from './dictionary.service';
import { DictionaryController } from './dictionary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Word, Topic, Lesson])],
  controllers: [DictionaryController],
  providers: [DictionaryService],
  exports: [DictionaryService, TypeOrmModule],
})
export class DictionaryModule {}

