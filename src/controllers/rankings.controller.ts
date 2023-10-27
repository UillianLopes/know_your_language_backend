import { RankingsService } from '@kyl/services/rankings.service';
import { ERankingType } from '@kyl/enums/ranking-type.enum';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RankingDto } from '@kyl/dto/ranking.dto';
import { OkListResponseDto } from '@kyl/decorators/list-response-dto.decorator';
import { TokenGuard } from '@kyl/guards/token.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';

@Controller('rankings')
@ApiTags('Rankings')
@ApiBearerAuth()
export class RankingsController {
  constructor(private readonly _rankingsService: RankingsService) {}

  @Get(':rankingType')
  @UseGuards(TokenGuard)
  @OkListResponseDto(RankingDto)
  @ApiQuery({ name: 'rankingType', enum: ERankingType })
  async getRankings(@Param('rankingType') rankingType: ERankingType) {
    return await this._rankingsService.getRankings(rankingType);
  }
}
