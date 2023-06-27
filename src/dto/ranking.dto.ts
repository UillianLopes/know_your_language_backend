import { ApiProperty } from '@nestjs/swagger';

export class RankingDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  value: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }
}
