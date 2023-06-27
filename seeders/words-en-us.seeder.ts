import { paginate } from '@kyl/utils/paginate.function';
import { Word } from '@kyl/entities/word.entity';
import { ELocale } from '@kyl/enums/locale.enum';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Seed } from '@kyl/entities/seed.entity';
import * as fs from 'fs';

export default class WordsEnUs1687705796 implements Seeder {
  readonly name = 'WordsEnUs1687705796';
  readonly timestamp = 1687705796;

  async run(dataSource: DataSource): Promise<any> {
    try {
      const wordsRepository = dataSource.getRepository(Word);
      const seedRepository = dataSource.getRepository(Seed);

      let seed = await seedRepository.findOneBy({
        name: this.name,
      });

      if (seed) {
        console.log(`THE SEED ${this.name} IS ALREADY APPLIED`);
        return;
      }

      const result = await (async () => {
        const readStream = fs.createReadStream('seeders/english-words.json');
        let data = '';

        for await (const chunk of readStream) {
          data += chunk;
        }

        const parsedData = JSON.parse(data);

        if (!parsedData) {
          return [];
        }

        return Object.keys(parsedData).filter((d) => d.length > 4);
      })();

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
            locale: ELocale.enUs,
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
