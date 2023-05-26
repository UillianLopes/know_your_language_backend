import { Injectable } from '@nestjs/common';
import {
  Configuration,
  CreateChatCompletionRequest,
  Model,
  OpenAIApi,
} from 'openai';
import { OpenAIWordMeaningsDto } from '../dto/word_meanings.dto';
import { Locale } from '../enums/locale';

@Injectable()
export class OpenAIService {
  private readonly configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_ID,
    apiKey: process.env.OPENAI_API_KEY,
  });

  private readonly openai = new OpenAIApi(this.configuration);
  private model: Model | null = null;

  async init(): Promise<void> {
    if (this.model !== null) {
      return;
    }

    const response = await this.openai.retrieveModel(process.env.OPENAI_MODEL);

    if (!response.data) {
      return;
    }

    this.model = response.data;
  }

  async getVariationsOf(
    locale: Locale,
    word: string,
  ): Promise<OpenAIWordMeaningsDto | null> {
    await this.init();
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

  private _generatePrompt(locale: Locale, word: string) {
    switch (locale) {
      case Locale.ptBr:
        return this._generatePtBrPrompt(word);

      case Locale.enUs:
        return this._generateEnUsPrompt(word);
    }
  }

  private _generatePtBrPrompt(word: string) {
    return `Nessa requisição preciso que você funcione da seguinte maneira, vou entrar com uma palavra em português do brasil, e você me dar como saída um json contendo as seguintes propriedades. success = um bool informando se você conseguiu encontrar ou não essa palavra no seu banco de dados. value = uma string contendo a própria palavra  em questão. meaning = um string contendo o significado da palavra em questão. fakeMeanings = um array de strings contento 3 opções de significados que não são corretos porem são parecidos com o significado da palavra. Importante: você deve gerar apenas o json, não retorne nenhum texto além do json, e também não precisa retornar a area de source code que você sempre retorna, o json não deve conter quebras de linhas. Entrada: ${word}`;
  }

  private _generateEnUsPrompt(word: string) {
    return `In this request I need you to work in the following way, I'll input a US english word, and you will give me as output a json containing the following properties. success = a boolean value telling if you was able to find the word in your database or not. value = a string containing the input word itself. meaning = a string with the meaning of the input word. fakeMeanings = a string array with 3 meaning options that aren't the correct ones, but are like to the correct meaning. Important you should return only json, the json should not contain linebreaks. Input: ${word}`;
  }
}
