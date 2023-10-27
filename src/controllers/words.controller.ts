import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResponseDto } from '@kyl/dto/response.dto';
import { OkResponseDto } from '@kyl/decorators/single-response-dto.decorator';
import {
  WordDto,
  GuessMeaningPayloadDto,
  GuessWordPayloadDto,
  GuessMeaningResponseDto,
  GuessWordResponseDto,
  GetKnownWordsDto,
} from '@kyl/dto/word.dto';
import { TokenGuard } from '@kyl/guards/token.guard';
import { WordsService } from '@kyl/services/words.service';
import { Request } from 'express';
import { EGameMode } from '@kyl/enums/game-mode.enum';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('words')
@ApiTags('Words')
@ApiBearerAuth()
export class WordsController {
  constructor(private readonly _wordsService: WordsService) {}

  @Get('unknown/:gameMode')
  @UseGuards(TokenGuard)
  @OkResponseDto(WordDto)
  @ApiParam({ name: 'gameMode', enum: EGameMode })
  async unknownWord(
    @Param('gameMode') gameMode: EGameMode,
    @Req() request: Request,
  ): Promise<ResponseDto<WordDto>> {
    const user = request.user;
    return await this._wordsService.getRandomUnknownWord(gameMode, user['id']);
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
  async knownWords(@Req() request: Request, @Query() query: GetKnownWordsDto) {
    const user = request.user;
    return this._wordsService.knownWords(user['id'], query);
  }
}
