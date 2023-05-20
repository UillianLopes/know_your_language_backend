import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from '../../services/users.service';

@Injectable()
export class GoogleTokenStrategy extends PassportStrategy(
  Strategy,
  'google-token',
) {
  constructor(
    @Inject(UsersService) private readonly userService: UsersService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: process.env.GOOGLE_SCOPES.split('|'), // Define the required scopes as per your needs
    });
  }

  async validate(
    _: string,
    __: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    console.log('PROFILE', profile);
    const email = this.extractEmails(profile);

    if (!email) {
      done('Invalid User');
      return;
    }

    const user = await this.userService.findByEmail(email);

    if (user) {
      done(null, { message: 'Authenticated', data: user });
      return;
    }

    await this.userService.create({
      name: profile.displayName,
      email,
      picture: this.extractPhoto(profile),
      provider: 'google',
    });

    done(null, user);
  }

  private extractEmails(profile: Profile): string | null {
    const emails = profile.emails;
    if (!emails || emails.length === 0) {
      return null;
    }
    return emails[0].value;
  }

  private extractPhoto(profile: Profile): string | null {
    const photos = profile.photos;
    if (!photos || photos.length === 0) {
      return null;
    }
    return photos[0].value;
  }
}
