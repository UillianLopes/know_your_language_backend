import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Word } from '../entities/word.entity';
import { Repository } from 'typeorm';
import { Meaning } from '../entities/meaning.entity';
import {
  MarkWordAsKnownDto,
  MarkWordAsKnownPayloadDto,
  WordDto,
} from '../dto/word.dto';
import { User } from '../entities/user.entity';
import { ResponseDto } from '../dto/response.dto';
import { Score } from '../entities/score.entity';
import { DateTime } from 'luxon';
import { UserWord } from '../entities/user_word.entity';

const MAX_SCORE = 10;
const SCORE_REASON = 5;

@Injectable()
export class WordsService {
  constructor(
    @Inject(OpenAIService) private readonly _openAiService: OpenAIService,
    @InjectRepository(Word) private readonly _wordRepository: Repository<Word>,
    @InjectRepository(UserWord)
    private readonly _userWordRepository: Repository<UserWord>,
    @InjectRepository(Score)
    private readonly _scoreRepository: Repository<Score>,
    @InjectRepository(Meaning)
    private readonly _meaningRepository: Repository<Meaning>,
    @InjectRepository(User) private readonly _userRepository: Repository<User>,
  ) {}

  async getAUnknownWord(userId: number): Promise<ResponseDto<WordDto>> {
    const user = await this._userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new BadRequestException('Invalid user');
    }

    const subQuery = this._wordRepository
      .createQueryBuilder('w')
      .leftJoin('w.users', 'us')
      .leftJoin('us.user', 'u')
      .where(`u.id = ${userId}`)
      .andWhere(`us.learned = true`)
      .andWhere('w.cached = true')
      .select('w.id')
      .getQuery();

    let word = await this._wordRepository
      .createQueryBuilder('word')
      .where(`word.id NOT IN (${subQuery})`)
      .andWhere('word.cached = true')
      .getOne();

    if (word) {
      const meanings = await this._meaningRepository
        .createQueryBuilder('meaning')
        .where('meaning.wordId = :wordId', { wordId: word.id })
        .orderBy('meaning.value')
        .getMany();

      const userWord = await this._userWordRepository.findOneBy({
        user,
        word,
      });

      return ResponseDto.create(
        'Unknown word obtained from the database.',
        WordDto.fromEntity(
          { ...word, meanings: this.suffle(meanings) },
          userWord?.incorrectAttempts ?? null,
        ),
      );
    }

    word = await this._wordRepository
      .createQueryBuilder('word')
      .where('word.cached = false')
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!word) {
      throw new BadRequestException('Invalid word');
    }

    const openAiWord = await this._openAiService.getVariationsOf(
      word.locale,
      word.value,
    );

    if (openAiWord == null) {
      throw new BadRequestException('Invalid word');
    }

    const realMeaning = this._meaningRepository.create({
      value: openAiWord.meaning,
      isFake: false,
      word,
    });

    const fakeMeanings = openAiWord.fakeMeanings.map((meaning) =>
      this._meaningRepository.create({
        value: meaning,
        isFake: true,
        word,
      }),
    );

    await this._meaningRepository.save(fakeMeanings.concat(realMeaning));
    await this._wordRepository.update(
      {
        id: word.id,
      },
      {
        cached: true,
      },
    );

    word = await this._wordRepository.findOneBy({
      id: word.id,
    });

    const meanings = await this._meaningRepository.findBy({
      word: {
        id: word.id,
      },
    });

    return ResponseDto.create(
      'Unknown word generated with success.',
      WordDto.fromEntity({
        ...word,
        meanings: this.suffle(meanings),
      }),
    );
  }

  async markAsKnow(userId: number, payload: MarkWordAsKnownPayloadDto) {
    const user = await this._userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new BadRequestException('Invalid user');
    }

    const word = await this._wordRepository.findOne({
      where: {
        id: payload.wordId,
      },
      relations: ['meanings'],
    });

    if (!word) {
      throw new BadRequestException('Invalid word');
    }

    const correctMeaning = (word.meanings ?? []).find(({ isFake }) => !isFake);

    if (!correctMeaning) {
      throw new BadRequestException('Invalid word');
    }

    let points = 0;

    let userWord = await this._userWordRepository.findOneBy({
      word,
      user,
    });

    if (!userWord) {
      userWord = this._userWordRepository.create({
        word,
        user,
        incorrectAttempts: 0,
        learned: false,
      });

      await this._userWordRepository.save(userWord);
    }

    if (!payload.force) {
      if (payload.meaningId === correctMeaning.id) {
        points = MAX_SCORE - userWord.incorrectAttempts * SCORE_REASON;
        points = points ?? 0;
      } else if (
        !(MAX_SCORE - (userWord.incorrectAttempts + 1) * SCORE_REASON)
      ) {
        const meaning = await this._meaningRepository.findOneBy({
          id: payload.meaningId,
        });

        if (meaning == null) {
          throw new BadRequestException('Invalid meaning');
        }
        points = 0;
        userWord.incorrectAttempts++;
      } else {
        userWord.incorrectAttempts++;
        await this._userWordRepository.save(userWord);
        return ResponseDto.create(
          'Incorrect answer',
          MarkWordAsKnownDto.forGuessTheMeaning(
            false,
            null,
            null,
            payload.meaningId,
            userWord.incorrectAttempts,
          ),
        );
      }
    }

    userWord.learned = true;
    await this._userWordRepository.save(userWord);

    const score = this._scoreRepository.create({
      value: points,
      timestamp: DateTime.utc().toISO(),
      user: user,
      word: word,
    });

    await this._scoreRepository.save(score);

    return ResponseDto.create(
      'Completed',
      MarkWordAsKnownDto.forGuessTheMeaning(
        true,
        points,
        correctMeaning.id,
        payload.meaningId,
        userWord.incorrectAttempts,
      ),
    );
  }

  suffle<T>(array: Array<T>) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
