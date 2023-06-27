import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../services/auth.service';
import { Injectable } from '@nestjs/common';
import { SignInDto } from '../dto/sign-in.dto';
import { ResponseDto } from '../dto/response.dto';
import { TokenDto } from '../dto/token.dto';
import { Strategy } from 'passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly _authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<ResponseDto<TokenDto>> {
    return await this._authService.signIn(new SignInDto(username, password));
  }
}
