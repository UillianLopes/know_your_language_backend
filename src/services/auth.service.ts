import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SignInDto } from '../dto/sign-in.dto';
import { ResponseDto } from '../dto/response.dto';
import { TokenDto } from '../dto/token.dto';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';
import { SignUpDto } from '../dto/sign-up.dto';
import * as argon2 from 'argon2';
import { EAuthProvider } from '../enums/auth-provider.enum';
import { UserDto } from '../dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly _userRepository: Repository<User>,
    private readonly _jwtService: JwtService,
  ) {}

  async signUp(command: SignUpDto): Promise<ResponseDto<UserDto>> {
    const existingUser = await this._userRepository.findOne({
      where: {
        email: command.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        `The e-mail ${command.email} is already in use`,
      );
    }

    const hashPassword = await argon2.hash(command.password);

    const user = await this._userRepository.create({
      email: command.email,
      name: command.name,
      password: hashPassword,
      provider: EAuthProvider.self,
    });

    await this._userRepository.save(user);

    return ResponseDto.create('', UserDto.fromEntity(user));
  }

  async signIn({ email, password }: SignInDto): Promise<ResponseDto<TokenDto>> {
    const user = await this._userRepository.findOneBy({
      email,
    });

    if (user == null) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const isAuthenticated = await user.checkPassword(password);

    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const accessToken = this._jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        username: user.email,
        name: user.name,
        provider: user.provider,
        picture: user.picture,
        locale: user.locale,
      },
      {
        secret: process.env.JWT_SECRET,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
      },
    );

    return ResponseDto.create('', new TokenDto(accessToken));
  }
}
