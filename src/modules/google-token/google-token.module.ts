import { Module } from '@nestjs/common';
import { GoogleTokenGuard } from './google-token.guard';
import { PassportModule } from '@nestjs/passport';
import { GoogleTokenStrategy } from './google-token.stategy';
import { UsersService } from 'src/services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({
      session: true,
      defaultStrategy: 'google-token',
    }),
  ],
  providers: [UsersService, GoogleTokenGuard, GoogleTokenStrategy],
  exports: [GoogleTokenGuard, GoogleTokenStrategy],
})
export class GoogleTokenModule {}
