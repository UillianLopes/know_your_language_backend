import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '@kyl/services/users.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { EAuthProvider } from '@kyl/enums/auth-provider.enum';
import * as process from 'process';
import { ELocale } from '@kyl/enums/locale.enum';

@Injectable()
export class TokenGuard extends AuthGuard('token') {
  constructor(
    @Inject(UsersService) private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    if (request.headers && request.headers.authorization) {
      const signInMethod = request.headers['sign-in-method'];

      switch (signInMethod) {
        case 'google':
          return await this.handleGoogleAuth(request);

        default:
          return await this.handleJwt(request);
      }
    }

    return false;
  }

  async handleJwt(request: Request): Promise<boolean> {
    const authorizationArray = request.headers.authorization.split(' ');

    if (!authorizationArray || authorizationArray.length < 2) {
      return false;
    }

    const [type, token] = authorizationArray;

    if (type !== 'Bearer') {
      return false;
    }

    const payload = await this._jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
    });

    if (!payload) {
      return false;
    }

    request.user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      provider: payload.provider,
      locale: payload.locale,
    };

    return true;
  }

  async handleGoogleAuth(request: Request): Promise<boolean> {
    const authorizationArray = request.headers.authorization.split(' ');

    if (!authorizationArray || authorizationArray.length < 2) {
      return false;
    }

    const accessToken = authorizationArray[1];
    const oAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const oAuthTicket = await oAuthClient.verifyIdToken({
      idToken: accessToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    if (!oAuthTicket) {
      return false;
    }

    const payload = oAuthTicket.getPayload();

    if (!payload) {
      return false;
    }

    let userEntity = await this._usersService.findByEmail(payload.email);

    if (userEntity) {
      if (payload.picture && payload.picture !== userEntity.picture) {
        await this._usersService.update(userEntity.id, {
          picture: userEntity.picture,
        });
      }

      if (!userEntity.locale && payload.locale) {
        await this._usersService.update(userEntity.id, {
          locale: this._handleLocale(userEntity.locale),
        });
      }
    } else {
      userEntity = await this._usersService.create({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: EAuthProvider.self,
        locale: this._handleLocale(payload.locale),
      });
    }

    request.user = {
      id: userEntity.id,
      name: userEntity.name,
      email: userEntity.email,
      provider: userEntity.provider,
      picture: userEntity.picture,
      local: this._handleLocale(userEntity.locale),
    };

    return true;
  }

  private _handleLocale(locale: string): ELocale {
    if (!locale || !locale.startsWith('pt')) {
      return ELocale.enUs;
    }

    return ELocale.ptBr;
  }
}
