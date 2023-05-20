import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meaning } from './entities/meaning.entity';
import { User } from './entities/user.entity';
import { Word } from './entities/word.entity';
import { Writing } from './entities/writing.entity';
import { RankingsModule } from './modules/rankings/rankings.module';
import { UsersModule } from './modules/users/users.module';
import { WordsModule } from './modules/words/words.module';
import { GoogleTokenModule } from './modules/google-token/google-token.module';

@Module({
  imports: [
    UsersModule,
    WordsModule,
    RankingsModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          synchronize: true,
          logging: true,
          entities: [User, Word, Meaning, Writing],
          migrations: [],
        };
      },
    }),
    GoogleTokenModule,
  ],
  controllers: [],
})
export class AppModule {}
