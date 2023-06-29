import { paginate } from '@kyl/utils/paginate.function';
import { Word } from '@kyl/entities/word.entity';
import { ELocale } from '@kyl/enums/locale.enum';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as wordsPt from 'words-pt';
import { Seed } from '@kyl/entities/seed.entity';
import * as process from 'process';
import { shuffle } from '@kyl/utils/shuffle.function';

export default class WordsPtBr1687698213 implements Seeder {
  readonly name = 'WordsPtBr1687698213';
  readonly timestamp = 1687698213;

  async run(dataSource: DataSource): Promise<any> {
    try {
      console.log('STARTING TO SEED THE DATABASE WITH PT-BR WORDS');
      const wordsRepository = dataSource.getRepository(Word);
      const seedRepository = dataSource.getRepository(Seed);
      let seed = await seedRepository.findOneBy({
        name: this.name,
      });

      if (seed) {
        console.log(`THE SEED ${this.name} IS ALREADY APPLIED`);
        return;
      }

      const result = await new Promise((resolve, reject) => {
        wordsPt.init({ removeNames: true }, (err: unknown) => {
          if (err) {
            reject(err);
            return;
          }
          const words = wordsPt.getArray();

          if (process.env.NODE_ENV === 'prod') {
            resolve(
              shuffle(
                words.filter((d) => d && d.length > 4 && !d.includes('-')),
              ).filter((_, i) => i < 1000),
            );
          } else {
            resolve(words.filter((d) => d && d.length > 4 && !d.includes('-')));
          }
        });
      });

      if (!(result instanceof Array<string>)) {
        console.log(`NO WORDS WERE FOUND`);
        return;
      }

      await dataSource.transaction(async (manager) => {
        seed = seedRepository.create({
          timestamp: this.timestamp,
          name: this.name,
        });

        const words = result.map((word) =>
          wordsRepository.create({
            value: word,
            locale: ELocale.ptBr,
            cached: false,
          }),
        );

        let isDone = false;
        let pageNumber = 1;
        const pageSize = 50;

        do {
          const paginatedWords = paginate(words, pageNumber, pageSize);
          await manager.save(paginatedWords);
          isDone = pageSize != paginatedWords.length;
          pageNumber++;
        } while (!isDone);

        await manager.save(seed);
      });

      console.log(`THE MIGRATION ${this.name} WAS SUCCESSFULLY EXECUTED`);
    } catch (e) {
      console.log(`AN ERROR OCCURRED WHILE SEEDING: ${this.name}`);
      console.log(e);
    }
  }
}
