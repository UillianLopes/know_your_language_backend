import { ApiProperty } from '@nestjs/swagger';

export class MeaningDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly isFake: boolean;

  @ApiProperty()
  readonly value: string;

  constructor(id: number, isFake: boolean, value: string) {
    this.id = id;
    this.isFake = isFake;
    this.value = value;
  }

  static fromEntity(meaning: MeaningDto) {
    return new MeaningDto(meaning.id, meaning.isFake, meaning.value);
  }
}
