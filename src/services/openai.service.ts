import { Injectable } from '@nestjs/common';
import {
  Configuration,
  CreateChatCompletionRequest,
  Model,
  OpenAIApi,
} from 'openai';
import { OpenAIWordMeaningsDto } from '../dto/word_meanings.dto';
import { ELocale } from '../enums/locale.enum';

@Injectable()
export class OpenAIService {
  private readonly configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_ID,
    apiKey: process.env.OPENAI_API_KEY,
  });

  private readonly openai = new OpenAIApi(this.configuration);
  private model: Model | null = null;

  async getVariationsOf(
    locale: ELocale,
    word: string,
  ): Promise<OpenAIWordMeaningsDto | null> {
    await this._init();
    const request: CreateChatCompletionRequest = {
      model: this.model.id,
      messages: [
        {
          role: 'system',
          content: this._generatePrompt(locale, word),
        },
      ],
      max_tokens: 2048,
      temperature: 0,
    };

    try {
      const response = await this.openai.createChatCompletion(request);
      const data = response.data;

      if (!data.choices || !data.choices.length) {
        return null;
      }
      const firstChoice = data.choices[0];
      const firstChoiceMessage = firstChoice?.message?.content;
      if (!firstChoiceMessage) {
        return null;
      }

      const regex = /\{[^{}]*\}/g;
      const matches = firstChoiceMessage.match(regex);
      if (!matches || !matches.length) {
        return null;
      }
      return JSON.parse(matches[0]);
    } catch (e) {
      return null;
    }
  }

  private async _init(): Promise<void> {
    if (this.model !== null) {
      return;
    }

    const response = await this.openai.retrieveModel(process.env.OPENAI_MODEL);

    if (!response.data) {
      return;
    }

    this.model = response.data;
  }

  private _generatePrompt(locale: ELocale, word: string) {
    switch (locale) {
      case ELocale.ptBr:
        return this._generatePtBrPrompt(word);

      case ELocale.enUs:
        return this._generateEnUsPrompt(word);
    }
  }

  private _generatePtBrPrompt(word: string) {
    return `Nesta requisição, vou entrar com uma palavra em português do brasil, e você deve me fornecer como saída um json contendo as seguintes propriedades.
    "success": Um bool informando se você conseguiu encontrar o significado dessa palavra no seu banco de dados. Caso não encontre, essa propriedade deve ser false; caso encontre, essa propriedade deve ser true.
    "value": Uma string contendo a própria palavra em questão.
    "meaning": Uma string contendo o significado da palavra. Se o significado não for encontrado, retorne uma string vazia "".
    "fakeMeanings": Um array de strings contendo 3 opções de significados falsos, porém parecidos com o significado da palavra. Cada uma das opções do "fakeMeanings" deve conter a mesma quantidade de palavras que a propriedade "meaning". Essa restrição de tamanho é indispensável. Se o significado ("meaning") não for encontrado, essa lista deve estar vazia.
    Por favor, gere apenas o json, não retorne nenhum texto além do json. O json não deve conter quebras de linhas. Caso você não encontre o significado da palavra, retorne a propriedade "fakeMeanings" como uma lista vazia e a propriedade "success" igual a false.
    Entrada: ${word}`;
  }

  private _generateEnUsPrompt(word: string) {
    return `In this request I need you to work in the following way, I'll input a US english word, and you will give me as output a json containing the following properties. success = a boolean value telling if you was able to find the word in your database or not. value = a string containing the input word itself. meaning = a string with the meaning of the input word. fakeMeanings = a string array with 3 meaning options that aren't the correct ones, but are like to the correct meaning. Important you should return only json, the json should not contain linebreaks. Input: ${word}`;
  }
}
