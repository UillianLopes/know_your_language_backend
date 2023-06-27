import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ELocale } from '@kyl/enums/locale.enum';

export class SignUpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  readonly email: string;

  @ApiProperty({
    enum: ELocale,
  })
  @IsNotEmpty()
  @IsIn([ELocale.enUs, ELocale.ptBr])
  readonly locale: ELocale;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly passwordConfirmation: string;
}
