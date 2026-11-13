import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { getTypeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';
import { SentencesModule } from './modules/sentences/sentences.module';
import { ProgressModule } from './modules/progress/progress.module';
import { AdaptiveModule } from './modules/adaptive/adaptive.module';
import { SeedModule } from './modules/seed/seed.module';
import { ContributionsModule } from './modules/contributions/contributions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), 'backend-core', '.env'),
        path.resolve(process.cwd(), '.env'),
        path.resolve(__dirname, '..', '.env'),
        path.resolve(__dirname, '..', '..', '.env'),
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: getTypeOrmConfig,
    }),
    AuthModule,
    UsersModule,
    DictionaryModule,
    SentencesModule,
    ProgressModule,
    AdaptiveModule,
    ContributionsModule,
    SeedModule,
  ],
})
export class AppModule {}
