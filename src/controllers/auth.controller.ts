import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SignInDto } from '@kyl/dto/sign-in.dto';
import { AuthService } from '@kyl/services/auth.service';
import { SignUpDto } from '@kyl/dto/sign-up.dto';
import { OkResponseDto } from '@kyl/decorators/single-response-dto.decorator';
import { TokenDto } from '@kyl/dto/token.dto';
import { UserDto } from '@kyl/dto/user.dto';
import * as fs from 'fs';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Put('sign-in')
  @OkResponseDto(TokenDto)
  async signIn(@Body() signIn: SignInDto) {
    const dir = fs.readdirSync('./');
    console.log(JSON.stringify(dir));
    return this._authService.signIn(signIn);
  }

  @Post('sign-up')
  @OkResponseDto(UserDto)
  async signUp(@Body() signUp: SignUpDto) {
    return this._authService.signUp(signUp);
  }
}
