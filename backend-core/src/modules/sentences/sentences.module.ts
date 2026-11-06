import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sentence } from './entities/sentence.entity';
import { SentencesService } from './sentences.service';
import { SentencesController } from './sentences.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sentence])],
  controllers: [SentencesController],
  providers: [SentencesService],
  exports: [SentencesService, TypeOrmModule],
})
export class SentencesModule {}

