import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Word } from '../entities/word.entity';
import { Repository } from 'typeorm';
import { Meaning } from '../entities/meaning.entity';
import { WordDto } from '../dto/word.dto';
import { User } from '../entities/user.entity';
import { ResponseDto } from 'src/dto/response.dto';

@Injectable()
export class WordsService {
  constructor(
    @Inject(OpenAIService) private readonly _openAiService: OpenAIService,
    @InjectRepository(Word) private readonly _wordRepository: Repository<Word>,
    @InjectRepository(Meaning)
    private readonly _meaningRepository: Repository<Meaning>,
    @InjectRepository(User) private readonly _userRepository: Repository<User>,
  ) {}

  async getAUnknownWord(userId: number): Promise<ResponseDto<WordDto>> {
    let word = await this._wordRepository
      .createQueryBuilder('word')
      .leftJoin('word.users', 'user', 'user.id = :userId', { userId })
      .where(`word.cached = :cached`, { cached: true })
      .getOne();

    if (word) {
      const meanings = await this._meaningRepository.findBy({
        word: word,
      });
      return ResponseDto.create('', WordDto.fromEntity({ ...word, meanings }));
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
      word: word,
    });

    const result = ResponseDto.create(
      'testing',
      WordDto.fromEntity({ ...word, meanings }),
    );

    return result;
  }

  async markAsKnow(userId: number, wordId: number) {
    const user = await this._userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new BadRequestException('Invalid user');
    }

    const word = await this._wordRepository.findOneBy({
      id: wordId,
    });

    if (!word) {
      throw new BadRequestException('Invalid word');
    }

    word.users.push(user);

    return await this._wordRepository.save(word);
  }
}
