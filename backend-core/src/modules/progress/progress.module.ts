import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeLog } from './entities/practice-log.entity';
import { UserProgress } from './entities/user-progress.entity';
import { User } from '../users/entities/user.entity';
import { ReviewItem } from '../adaptive/entities/review-item.entity';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PracticeLog, UserProgress, User, ReviewItem])],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService, TypeOrmModule],
})
export class ProgressModule {}

