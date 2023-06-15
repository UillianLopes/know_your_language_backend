import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ResponseDto } from '../dto/response.dto';
import { OkResponseDto } from '../decorators/single-response-dto.decorator';
import {
  WordDto,
  GuessMeaningPayloadDto,
  GuessWordPayloadDto,
  GuessMeaningResponseDto,
  GuessWordResponseDto,
} from '../dto/word.dto';
import { TokenGuard } from '../guards/token.guard';
import { WordsService } from '../services/words.service';
import { Request } from 'express';

@Controller('words')
export class WordsController {
  constructor(private readonly _wordsService: WordsService) {}

  @Get('unknown')
  @UseGuards(TokenGuard)
  @OkResponseDto(WordDto)
  async unknownWord(@Req() request: Request): Promise<ResponseDto<WordDto>> {
    const user = request.user;
    return await this._wordsService.getRandomUnknownWord(user['id']);
  }

  @Post('guess-meaning')
  @UseGuards(TokenGuard)
  @OkResponseDto(WordDto)
  async guessMeaning(
    @Req() request: Request,
    @Body() payload: GuessMeaningPayloadDto,
  ): Promise<ResponseDto<GuessMeaningResponseDto>> {
    const user = request.user;
    return await this._wordsService.guessMeaning(user['id'], payload);
  }

  @Post('guess-word')
  @UseGuards(TokenGuard)
  @OkResponseDto(WordDto)
  async guessWord(
    @Req() request: Request,
    @Body() payload: GuessWordPayloadDto,
  ): Promise<ResponseDto<GuessWordResponseDto>> {
    const user = request.user;
    return await this._wordsService.guessWord(user['id'], payload);
  }

  @Get('known')
  @UseGuards(TokenGuard)
  @OkResponseDto(WordDto)
  async knownWords(@Req() request: Request) {
    const user = request.user;
    return await this._wordsService.getRandomUnknownWord(user['id']);
  }
}
