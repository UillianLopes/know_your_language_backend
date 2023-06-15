import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../services/users.service';
import { Request } from 'express';

@Injectable()
export class TokenGuard extends AuthGuard('token') {
  constructor(
    @Inject(UsersService) private readonly _usersService: UsersService,
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
          return false;
      }
    }

    return false;
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
      userEntity.picture != payload.picture &&
        (await this._usersService.update(userEntity.id, {
          picture: userEntity.picture,
        }));
    } else {
      userEntity = await this._usersService.create({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: 'google',
      });
    }

    request.user = {
      id: userEntity.id,
      name: userEntity.name,
      email: userEntity.email,
      provider: userEntity.provider,
      picture: userEntity.picture,
    };

    return true;
  }
}
