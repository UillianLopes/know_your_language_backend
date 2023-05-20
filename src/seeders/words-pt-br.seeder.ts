import { paginateArray } from '../utils/paginate-array.function';
import { Word } from '../entities/word.entity';
import { Locale } from '../enums/locale';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as wordsPt from 'words-pt';

export default class WordsSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<any> {
    try {
      const wordsRepository = dataSource.getRepository(Word);

      const result = await new Promise((resolve, reject) => {
        wordsPt.init({ removeNames: true }, (err: unknown) => {
          if (err) {
            reject(err);
            return;
          }
          const words = wordsPt.getArray();

          resolve(words.filter((d) => !d.includes('-')));
        });
      });

      if (!(result instanceof Array<string>)) {
        return;
      }

      const words = result.map((word) =>
        wordsRepository.create({ value: word, locale: Locale.ptBr }),
      );

      let isDone = false;
      let pageNumber = 1;
      const pageSize = 50;

      do {
        const paginatedWords = paginateArray(words, pageNumber, pageSize);
        await wordsRepository.save(paginatedWords);
        isDone = pageSize != paginatedWords.length;
        pageNumber++;
      } while (!isDone);
    } catch (e) {
      console.log('AN ERROR OCURRED WHILE SEEDING');
      console.log(e);
    }
  }
}
