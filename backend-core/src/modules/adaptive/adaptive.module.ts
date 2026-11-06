import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewItem } from './entities/review-item.entity';
import { PracticeLog } from '../progress/entities/practice-log.entity';
import { User } from '../users/entities/user.entity';
import { Word } from '../dictionary/entities/word.entity';
import { AdaptiveService } from './adaptive.service';
import { AdaptiveController } from './adaptive.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewItem, PracticeLog, User, Word])],
  controllers: [AdaptiveController],
  providers: [AdaptiveService],
  exports: [AdaptiveService, TypeOrmModule],
})
export class AdaptiveModule {}

