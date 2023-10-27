import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { ListResponseDto, ResponseDto } from '../dto/response.dto';
import {
  GuessMeaningResponseDto,
  GuessMeaningPayloadDto,
  WordDto,
  GuessWordPayloadDto,
  GuessWordResponseDto,
  GetKnownWordsDto,
} from '../dto/word.dto';
import { Meaning } from '../entities/meaning.entity';
import { Score } from '../entities/score.entity';
import { User } from '../entities/user.entity';
import { UserWord } from '../entities/user_word.entity';
import { Word } from '../entities/word.entity';
import { shuffle } from '../utils/shuffle.function';
import { OpenAIService } from './openai.service';
import { EGameMode } from '../enums/game-mode.enum';

const MAX_SCORE = 10;
const SCORE_REASON = 5;

@Injectable()
export class WordsService {
  constructor(
    @Inject(OpenAIService)
    private readonly _openAiService: OpenAIService,
    @InjectRepository(Word)
    private readonly _wordRepository: Repository<Word>,
    @InjectRepository(UserWord)
    private readonly _userWordRepository: Repository<UserWord>,
    @InjectRepository(Score)
    private readonly _scoreRepository: Repository<Score>,
    @InjectRepository(Meaning)
    private readonly _meaningRepository: Repository<Meaning>,
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
  ) {}

  async getRandomUnknownWord(
    gameMode: EGameMode,
    userId: number,
  ): Promise<ResponseDto<WordDto>> {
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
      .andWhere(`w.locale = '${user.locale}'`)
      .andWhere(`us.learned = true`)
      .andWhere('w.cached = true')
      .andWhere(`us.gameMode = '${gameMode}'`)
      .select('w.id')
      .getQuery();

    let word = await this._wordRepository
      .createQueryBuilder('w')
      .innerJoin('w.users', 'uw')
      .where(`w.id NOT IN (${subQuery})`)
      .andWhere(`w.locale = '${user.locale}'`)
      .andWhere(`w.cached = true`)
      .andWhere(`uw.gameMode = '${gameMode.toString()}'`)
      .andWhere(`uw.userId = ${userId}`)
      .orderBy('RANDOM()')
      .getOne();

    if (word) {
      const meanings = await this._meaningRepository
        .createQueryBuilder('meaning')
        .where('meaning.wordId = :wordId', { wordId: word.id })
        .orderBy('meaning.value')
        .getMany();

      const userWord = await this._userWordRepository.findOneBy({
        user: {
          id: user.id,
        },
        word: {
          id: word.id,
        },
        gameMode,
      });

      return ResponseDto.create(
        'Unknown word obtained from the database.',
        WordDto.fromEntity(
          { ...word, meanings: shuffle(meanings) },
          userWord?.incorrectAttempts ?? null,
        ),
      );
    }

    word = await this.generateRandomWordWithMeanings();

    const meanings = await this._meaningRepository
      .createQueryBuilder('meaning')
      .where('meaning.wordId = :wordId', { wordId: word.id })
      .orderBy('meaning.value')
      .getMany();

    if (word) {
      const userWord = this._userWordRepository.create({
        user,
        word,
        gameMode,
        incorrectAttempts: 0,
        learned: false,
      });

      await this._userWordRepository.save(userWord);
    }

    return ResponseDto.create(
      'Unknown word generated with success.',
      WordDto.fromEntity({ ...word, meanings: shuffle(meanings) }, null),
    );
  }

  async getRandomUnknownWords(count: number): Promise<ResponseDto<WordDto[]>> {
    const words: WordDto[] = [];

    for (let i = 0; i < count; i++) {
      const word = await this.generateRandomWordWithMeanings();
      words.push(WordDto.fromEntity(word));
    }

    return ResponseDto.create('', words);
  }

  async guessMeaning(
    userId: number,
    payload: GuessMeaningPayloadDto,
  ): Promise<ResponseDto<GuessMeaningResponseDto>> {
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
      word: {
        id: word.id,
      },
      user: {
        id: user.id,
      },
    });

    if (!userWord) {
      userWord = this._userWordRepository.create({
        word,
        user,
        gameMode: EGameMode.guessTheMeaning,
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
          new GuessMeaningResponseDto(
            false,
            correctMeaning.id,
            payload.meaningId,
            null,
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
      new GuessMeaningResponseDto(
        true,
        correctMeaning.id,
        payload.meaningId,
        points,
        userWord.incorrectAttempts,
      ),
    );
  }

  async guessWord(
    userId: number,
    payload: GuessWordPayloadDto,
  ): Promise<ResponseDto<GuessWordResponseDto>> {
    const user = await this._userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new BadRequestException('Invalid user');
    }

    const word = await this._wordRepository.findOneBy({
      id: payload.wordId,
    });

    let userWord = await this._userWordRepository.findOne({
      where: {
        word: {
          id: word.id,
        },
        user: {
          id: word.id,
        },
      },
      relations: ['word'],
    });

    if (!userWord) {
      userWord = this._userWordRepository.create({
        word,
        user,
        gameMode: EGameMode.guessTheWord,
        incorrectAttempts: 0,
        learned: false,
      });

      await this._userWordRepository.save(userWord);
    }

    if (payload.force) {
      userWord.learned = true;
      await this._userWordRepository.save(userWord);
      return ResponseDto.create(
        '',
        new GuessWordResponseDto(true, 0, userWord.incorrectAttempts),
      );
    }

    if (
      userWord.word.value.trim().toLowerCase() ===
      payload.word.trim().toLowerCase()
    ) {
      return ResponseDto.create(
        '',
        new GuessWordResponseDto(true, 10, userWord.incorrectAttempts),
      );
    }

    userWord.incorrectAttempts++;
    await this._userWordRepository.save(userWord);

    return ResponseDto.create(
      '',
      new GuessWordResponseDto(false, 0, userWord.incorrectAttempts),
    );
  }

  async knownWords(
    userId: number,
    query: GetKnownWordsDto,
  ): Promise<ListResponseDto<WordDto>> {
    const queryBuilder = this._wordRepository
      .createQueryBuilder('word')
      .innerJoin('word.users', 'uw')
      .where(`uw.userId = ${userId}`)
      .andWhere(`uw.learned = true`)
      .orderBy('word.value', 'ASC')
      .skip((query.page - 1) * query.size)
      .take(query.size);

    const words = (await queryBuilder.getMany()) ?? [];

    return ListResponseDto.withoutMessage(
      words.map((word) => WordDto.fromEntity(word)),
      10,
      10,
    );
  }

  private async generateRandomWordWithMeanings(): Promise<Word | null> {
    const word = await this._wordRepository
      .createQueryBuilder('word')
      .where('word.cached = false')
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!word) {
      return null;
    }

    const openAiWord = await this._openAiService.getVariationsOf(
      word.locale,
      word.value,
    );

    if (!openAiWord || !openAiWord.success) {
      return await this.generateRandomWordWithMeanings();
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

    return word;
  }
}
