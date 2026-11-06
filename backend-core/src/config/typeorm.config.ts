import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Topic } from '../modules/dictionary/entities/topic.entity';
import { Lesson } from '../modules/dictionary/entities/lesson.entity';
import { Word } from '../modules/dictionary/entities/word.entity';
import { Sentence } from '../modules/sentences/entities/sentence.entity';
import { UserProgress } from '../modules/progress/entities/user-progress.entity';
import { PracticeLog } from '../modules/progress/entities/practice-log.entity';
import { ReviewItem } from '../modules/adaptive/entities/review-item.entity';

export const allEntities = [
  User,
  Topic,
  Lesson,
  Word,
  Sentence,
  UserProgress,
  PracticeLog,
  ReviewItem,
];

export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  const isSqlite = process.env.DB_TYPE === 'sqlite';

  if (isSqlite) {
    return {
      type: 'sqlite',
      database: process.env.DB_SQLITE_PATH || 'signlingo_dev.sqlite',
      entities: allEntities,
      synchronize: true,
      logging: false,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'signlingo',
    entities: allEntities,
    synchronize: process.env.DB_SYNCHRONIZE !== 'false',
    logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
    autoLoadEntities: true,
  };
};

