import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MarkWordAsKnownDto, WordDto } from 'src/dto/word.dto';
import { WordsService } from '../../services/words.service';
import { OkResponseDto } from '../../decorators/single-response-dto.decorator';
import { UserDto } from '../../dto/user.dto';
import { GoogleTokenGuard } from '../google-token/google-token.guard';
import { ResponseDto } from 'src/dto/response.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(
    @Inject(WordsService) private readonly wordsService: WordsService,
  ) {}

  @Get('profile')
  @UseGuards(GoogleTokenGuard)
  @OkResponseDto(UserDto)
  async profile(@Req() request: Request) {
    return {
      message: 'Profile loaded.',
      data: request.user,
    };
  }

  @Get('words/unknown')
  @UseGuards(GoogleTokenGuard)
  @OkResponseDto(WordDto)
  async unknownWord(@Req() request: Request): Promise<ResponseDto<WordDto>> {
    const user = request.user;
    const result = await this.wordsService.getAUnknownWord(user['id']);
    return result;
  }

  @Get('words/known')
  @UseGuards(GoogleTokenGuard)
  @OkResponseDto(WordDto)
  async knownWords(@Req() request: Request) {
    const user = request.user;
    return await this.wordsService.getAUnknownWord(user['id']);
  }

  @Post('words/known')
  @UseGuards(GoogleTokenGuard)
  @OkResponseDto(WordDto)
  async markWordAsKnown(
    @Req() request: Request,
    @Body() payload: MarkWordAsKnownDto,
  ) {
    const user = request.user;
    return await this.wordsService.markAsKnow(user['id'], payload.wordId);
  }
}
