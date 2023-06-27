import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { ELocale } from '@kyl/enums/locale.enum';

export class UserDto {
  @ApiProperty({
    type: 'number',
  })
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  picture?: string;

  @ApiProperty()
  provider: string;

  @ApiProperty({
    enum: ELocale,
  })
  locale: ELocale;

  constructor(
    id: number,
    name: string,
    email: string,
    picture: string,
    provider: string,
    locale: ELocale,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.picture = picture;
    this.provider = provider;
    this.locale = locale;
  }

  static fromEntity(user: User) {
    return new UserDto(
      user.id,
      user.name,
      user.email,
      user.picture,
      user.provider,
      user.locale,
    );
  }
}
