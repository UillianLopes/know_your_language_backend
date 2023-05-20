import { ApiProperty } from '@nestjs/swagger';
import { MeaningDto } from './meaning.dto';
import { Word } from 'src/entities/word.entity';

export class WordDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly value: string;

  @ApiProperty({
    type: [MeaningDto],
  })
  readonly meanings: MeaningDto[];

  constructor(id: number, value: string, meanings: MeaningDto[]) {
    this.id = id;
    this.value = value;
    this.meanings = meanings;
  }

  static fromEntity(word: Partial<WordDto>) {
    return new WordDto(
      word.id,
      word.value,
      word.meanings?.map((meaning) => MeaningDto.fromEntity(meaning)),
    );
  }
}

export class MarkWordAsKnownDto {
  @ApiProperty()
  readonly wordId: number;

  constructor(wordId: number) {
    this.wordId = wordId;
  }
}
