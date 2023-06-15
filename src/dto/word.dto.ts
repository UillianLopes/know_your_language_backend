import { ApiProperty } from '@nestjs/swagger';
import { MeaningDto } from './meaning.dto';
import { Word } from '../entities/word.entity';

export class WordDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly value: string;

  @ApiProperty({
    type: [MeaningDto],
  })
  readonly meanings: MeaningDto[];

  @ApiProperty()
  incorrectAttempts: number | null;

  constructor(
    id: number,
    value: string,
    meanings: MeaningDto[],
    incorrectAttempts: number | null,
  ) {
    this.id = id;
    this.value = value;
    this.meanings = meanings;
    this.incorrectAttempts = incorrectAttempts;
  }

  static fromEntity(
    word: Partial<Word>,
    incorrectAttempts: number | null = null,
  ) {
    return new WordDto(
      word.id,
      word.value,
      word.meanings?.map((meaning) => MeaningDto.fromEntity(meaning)),
      incorrectAttempts,
    );
  }
}

export class GuessMeaningPayloadDto {
  @ApiProperty()
  readonly wordId: number;

  @ApiProperty()
  readonly meaningId: number;

  @ApiProperty()
  readonly force: boolean | null;
}

export class GuessWordPayloadDto {
  @ApiProperty()
  readonly wordId: number;

  @ApiProperty()
  readonly word: string;

  @ApiProperty()
  readonly force: boolean | null;
}

export class GuessMeaningResponseDto {
  @ApiProperty()
  readonly correctMeaningId: number | null;

  @ApiProperty()
  readonly meaningId: number | null;

  @ApiProperty()
  readonly score: number | null;

  @ApiProperty()
  readonly completed: boolean;

  @ApiProperty()
  readonly incorrectAttempts: number | null;

  constructor(
    completed: boolean,
    correctMeaningId: number | null = null,
    meaingId: number | null,
    score: number | null = null,
    incorrectAttempts: number | null = null,
  ) {
    this.completed = completed;
    this.correctMeaningId = correctMeaningId;
    this.meaningId = meaingId;
    this.score = score;
    this.incorrectAttempts = incorrectAttempts;
  }
}

export class GuessWordResponseDto {
  @ApiProperty()
  readonly completed: boolean;

  @ApiProperty()
  readonly score: number | null;

  @ApiProperty()
  readonly incorrectAttempts: number | null;

  constructor(
    completed: boolean,
    score: number | null = null,
    incorrectAttempts: number | null = null,
  ) {
    this.completed = completed;
    this.score = score;
    this.incorrectAttempts = incorrectAttempts;
  }
}
