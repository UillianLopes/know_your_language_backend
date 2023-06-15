import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { OkResponseDto } from '../decorators/single-response-dto.decorator';
import { UserDto } from '../dto/user.dto';
import { TokenGuard } from '../guards/token.guard';
import { ResponseDto } from '../dto/response.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  @Get('profile')
  @UseGuards(TokenGuard)
  @OkResponseDto(UserDto)
  async profile(@Req() request: Request): Promise<ResponseDto<Express.User>> {
    return ResponseDto.create('Profile loaded.', request.user);
  }
}
