import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Seed } from '@kyl/entities/seed.entity';
import { Prompt } from '@kyl/entities/prompt.entity';
import { ELocale } from '@kyl/enums/locale.enum';

export default class PromptsSeeder1690164786 implements Seeder {
  readonly name = 'PromptsSeeder1690164786';
  readonly timestamp = 1690164786;
  async run(dataSource: DataSource): Promise<any> {
    try {
      const seedRepository = dataSource.getRepository(Seed);

      let seed = await seedRepository.findOneBy({
        name: this.name,
      });

      if (seed) {
        console.log(`THE SEED ${this.name} IS ALREADY APPLIED`);
        return;
      }

      const promptRepository = dataSource.getRepository(Prompt);
      const ptBrPrompt = promptRepository.create({
        locale: ELocale.ptBr,
        value: `Nesta requisição, vou entrar com uma palavra em português do brasil, e você deve me fornecer como saída um json contendo as seguintes propriedades. "success": Um bool informando se você conseguiu encontrar o significado dessa palavra no seu banco de dados. Caso não encontre, essa propriedade deve ser false; caso encontre, essa propriedade deve ser true. "value": Uma string contendo a própria palavra em questão. "meaning": Uma string contendo o significado da palavra. Se o significado não for encontrado, retorne uma string vazia "". "fakeMeanings": Um array de strings contendo 3 opções de significados falsos, porém parecidos com o significado da palavra. Cada uma das opções do "fakeMeanings" deve conter a mesma quantidade de palavras que a propriedade "meaning". Essa restrição de tamanho é indispensável. Se o significado ("meaning") não for encontrado, essa lista deve estar vazia. Por favor, gere apenas o json, não retorne nenhum texto além do json. O json não deve conter quebras de linhas. Caso você não encontre o significado da palavra, retorne a propriedade "fakeMeanings" como uma lista vazia e a propriedade "success" igual a false. Entrada: *[word]*`,
      });

      const enUsPrompt = promptRepository.create({
        locale: ELocale.enUs,
        value: `In this request I need you to work in the following way, I'll input a US english word, and you will give me as output a json containing the following properties. success = a boolean value telling if you was able to find the word in your database or not. value = a string containing the input word itself. meaning = a string with the meaning of the input word. fakeMeanings = a string array with 3 meaning options that aren't the correct ones, but are like to the correct meaning. Important you should return only json, the json should not contain linebreaks. Input: *[word]*`,
      });

      await promptRepository.save(ptBrPrompt);
      await promptRepository.save(enUsPrompt);

      seed = seedRepository.create({
        name: this.name,
        timestamp: this.timestamp,
      });

      await seedRepository.save(seed);
      console.log(`THE SEED ${this.name} WAS SUCCESSFULLY EXECUTED`);
    } catch (err) {
      console.log(`FAILED TO RUN: ${this.name}`);
      return false;
    }
  }
}
