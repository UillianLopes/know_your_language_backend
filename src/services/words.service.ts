import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Word } from '../entities/word.entity';
import { Repository } from 'typeorm';
import { Meaning } from '../entities/meaning.entity';
import { MarkWordAsKnownDto, WordDto } from '../dto/word.dto';
import { User } from '../entities/user.entity';
import { ResponseDto } from 'src/dto/response.dto';
import { Score } from 'src/entities/score.entity';
import { DateTime } from 'luxon';

@Injectable()
export class WordsService {
  constructor(
    @Inject(OpenAIService) private readonly _openAiService: OpenAIService,
    @InjectRepository(Word) private readonly _wordRepository: Repository<Word>,
    @InjectRepository(Score)
    private readonly _scoreRepository: Repository<Score>,
    @InjectRepository(Meaning)
    private readonly _meaningRepository: Repository<Meaning>,
    @InjectRepository(User) private readonly _userRepository: Repository<User>,
  ) {}

  async getAUnknownWord(userId: number): Promise<ResponseDto<WordDto>> {
    const subQuery = this._wordRepository
      .createQueryBuilder('w')
      .leftJoin('w.users', 'u')
      .where(`u.id = ${userId}`)
      .andWhere('w.cached = true')
      .select('w.id')
      .getQuery();

    const words = await this._wordRepository
      .createQueryBuilder('word')
      .where(`word.id NOT IN (${subQuery})`)
      .andWhere('word.cached = true')
      .getMany();

    let word = words[0];

    if (word) {
      const meanings = await this._meaningRepository
        .createQueryBuilder('meaning')
        .where('meaning.wordId = :wordId', { wordId: word.id })
        .orderBy('meaning.value')
        .getMany();

      return ResponseDto.create(
        'Unknown word obtained from the database.',
        WordDto.fromEntity({ ...word, meanings: this.suffle(meanings) }),
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

  async markAsKnow(userId: number, payload: MarkWordAsKnownDto) {
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
      relations: ['users'],
    });

    if (!word) {
      throw new BadRequestException('Invalid word');
    }

    if (word.users) {
      word.users.push(user);
    } else {
      word.users = [user];
    }
    await this._wordRepository.save(word);

    const score = this._scoreRepository.create({
      value: payload.points,
      timestamp: DateTime.utc().toISO(),
      user: user,
      word: word,
    });

    await this._scoreRepository.save(score);

    return ResponseDto.create('Learned', 1);
  }

  suffle<T>(array: Array<T>) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
