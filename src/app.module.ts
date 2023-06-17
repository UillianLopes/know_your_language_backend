import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meaning } from './entities/meaning.entity';
import { User } from './entities/user.entity';
import { Word } from './entities/word.entity';
import { Score } from './entities/score.entity';
import { UserWord } from './entities/user_word.entity';
import { PassportModule } from '@nestjs/passport';
import { UsersController } from './controllers/users.controller';
import { WordsController } from './controllers/words.controller';
import { RankingsController } from './controllers/rankings.controller';
import { UsersService } from './services/users.service';
import { WordsService } from './services/words.service';
import { OpenAIService } from './services/openai.service';
import { TokenGuard } from './guards/token.guard';
import { RankingsService } from './services/rankings.service';

@Module({
  imports: [
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
          logging: false,
          entities: [User, Word, Meaning, Score, UserWord],
          migrations: [],
        };
      },
    }),
    PassportModule.register({
      session: true,
      defaultStrategy: 'token',
    }),
    TypeOrmModule.forFeature([User, Word, Meaning, Score, UserWord]),
  ],
  providers: [
    TokenGuard,
    UsersService,
    WordsService,
    RankingsService,
    OpenAIService,
  ],
  controllers: [UsersController, WordsController, RankingsController],
})
export class AppModule {}
