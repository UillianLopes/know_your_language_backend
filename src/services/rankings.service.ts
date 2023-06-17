import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Score } from '../entities/score.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RankingDto } from '../dto/ranking.dto';
import { ResponseDto } from '../dto/response.dto';
import { ERankingType } from '../enums/ranking-type.enum';

@Injectable()
export class RankingsService {
  constructor(
    @InjectRepository(Score)
    private readonly _scoresRepository: Repository<Score>,
  ) {}

  async getRankings(ranking: ERankingType): Promise<ResponseDto<RankingDto[]>> {
    let queryBuilder = this._scoresRepository
      .createQueryBuilder('s')
      .innerJoin('s.user', 'u')
      .where('s.value > 0');

    switch (ranking) {
      case ERankingType.dayly:
        queryBuilder = queryBuilder.andWhere(
          `s.timestamp > date_trunc('day', timezone('utc', NOW()))`,
        );
        break;
      case ERankingType.weekly:
        queryBuilder = queryBuilder.andWhere(
          `s.timestamp > date_trunc('week', timezone('utc', NOW()))`,
        );
        break;
      case ERankingType.monthly:
        queryBuilder = queryBuilder.andWhere(
          `s.timestamp > date_trunc('month', timezone('utc', NOW()))`,
        );
        break;
      case ERankingType.yearly:
        queryBuilder = queryBuilder.andWhere(
          `s.timestamp > date_trunc('year', timezone('utc', NOW()))`,
        );
        break;
    }

    queryBuilder = queryBuilder
      .groupBy('u.id')
      .addGroupBy('u.name')
      .select(['u.name as name', 'SUM(s.value) as value'])
      .orderBy('2', 'DESC')
      .addOrderBy('1', 'ASC');

    const response = await queryBuilder.getRawMany();

    if (!response || !response.length) {
      return ResponseDto.create('No scores found', []);
    }

    return ResponseDto.create(
      'Scores found',
      response.map((r) => new RankingDto(r.name, r.value)),
    );
  }
}
