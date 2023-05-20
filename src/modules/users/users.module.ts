import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from '../../services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { OpenAIService } from '../../services/openai.service';
import { WordsService } from '../../services/words.service';
import { Word } from '../../entities/word.entity';
import { Meaning } from '../../entities/meaning.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Word, Meaning])],
  controllers: [UsersController],
  providers: [OpenAIService, UsersService, WordsService],
})
export class UsersModule {}
