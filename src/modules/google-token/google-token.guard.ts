import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../../services/users.service';

@Injectable()
export class GoogleTokenGuard extends AuthGuard('google-token') {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (request.headers && request.headers.authorization) {
      const authorizationArray = request.headers.authorization.split(' ');
      if (authorizationArray && authorizationArray.length > 1) {
        const accessToken = authorizationArray[1];
        const oAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const oAuthTicket = await oAuthClient.verifyIdToken({
          idToken: accessToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = oAuthTicket.getPayload();

        if (payload) {
          let userEntity = await this.usersService.findByEmail(payload.email);
          if (userEntity) {
            userEntity.picture != payload.picture &&
              (await this.usersService.update(userEntity.id, {
                picture: userEntity.picture,
              }));
          } else {
            userEntity = await this.usersService.create({
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
        }
        return true;
      }
    }

    throw new UnauthorizedException();
  }
}
