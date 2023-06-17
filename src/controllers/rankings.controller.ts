import { Controller, Get, Param } from '@nestjs/common';
import { RankingsService } from '../services/rankings.service';
import { ERankingType } from '../enums/ranking-type.enum';
import { ApiTags } from '@nestjs/swagger';

@Controller('rankings')
@ApiTags('Rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get(':rankingType')
  getRankings(@Param('rankingType') rankingType: ERankingType) {
    return this.rankingsService.getRankings(rankingType);
  }
}
