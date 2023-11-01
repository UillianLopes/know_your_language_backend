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
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { Prompt } from '@kyl/entities/prompt.entity';

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
          logging: true,
          entities: [User, Word, Meaning, Score, UserWord, Prompt],
          migrationsRun: true,
        };
      },
    }),
    PassportModule,
    PassportModule.register({
      session: true,
      defaultStrategy: 'token',
    }),
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            audience: process.env.JWT_AUDIENCE,
            issuer: process.env.JWT_ISSUER,
            expiresIn: process.env.JWT_EXPIRES_IN,
          },
          verifyOptions: {
            audience: process.env.JWT_AUDIENCE,
            issuer: process.env.JWT_ISSUER,
          },
        };
      },
    }),
    TypeOrmModule.forFeature([User, Word, Meaning, Score, UserWord, Prompt]),
  ],
  providers: [
    TokenGuard,
    UsersService,
    WordsService,
    RankingsService,
    OpenAIService,
    AuthService,
    JwtStrategy,
  ],
  controllers: [
    UsersController,
    WordsController,
    RankingsController,
    AuthController,
  ],
})
export class AppModule {}
