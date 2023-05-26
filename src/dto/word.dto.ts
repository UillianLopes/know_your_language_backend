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

export class MarkWordAsKnownPayloadDto {
  @ApiProperty()
  readonly wordId: number;

  @ApiProperty()
  readonly meaningId: number;

  @ApiProperty()
  readonly force: boolean | null;
}

export class MarkWordAsKnownDto {
  @ApiProperty()
  correctMeaningId: number | null;

  @ApiProperty()
  meaningId: number | null;

  @ApiProperty()
  score: number | null;

  @ApiProperty()
  completed: boolean;

  @ApiProperty()
  incorrectAttempts: number | null;

  constructor(
    completed: boolean,
    correctMeaningId: number | null = null,
    meaingId: number | null,
    score: number | null = null,
    incorrectAttempts: number | null = null,
  ) {
    this.correctMeaningId = correctMeaningId;
    this.meaningId = meaingId;
    this.score = score;
    this.completed = completed;
    this.incorrectAttempts = incorrectAttempts;
  }

  static forGuessTheMeaning(
    completed: boolean,
    score: number | null = null,
    correctMeaningId: number | null = null,
    meaningId: number | null,
    incorrectAttempts: number | null = null,
  ) {
    return new MarkWordAsKnownDto(
      completed,
      correctMeaningId,
      meaningId,
      score,
      incorrectAttempts,
    );
  }
}
