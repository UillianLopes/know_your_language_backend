import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty()
  readonly accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}
