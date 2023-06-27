import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { OkResponseDto } from '@kyl/decorators/single-response-dto.decorator';
import { UserDto } from '@kyl/dto/user.dto';
import { TokenGuard } from '@kyl/guards/token.guard';
import { ResponseDto } from '@kyl/dto/response.dto';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  @Get('profile')
  @UseGuards(TokenGuard)
  @OkResponseDto(UserDto)
  async profile(@Req() request: Request): Promise<ResponseDto<Express.User>> {
    return ResponseDto.create('Profile loaded.', request.user);
  }
}
