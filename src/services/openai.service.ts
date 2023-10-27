import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  Configuration,
  CreateChatCompletionRequest,
  Model,
  OpenAIApi,
} from 'openai';
import { OpenAIWordMeaningsDto } from '../dto/word_meanings.dto';
import { ELocale } from '../enums/locale.enum';
import { Repository } from 'typeorm';
import { Prompt } from '@kyl/entities/prompt.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OpenAIService {
  private readonly configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_ID,
    apiKey: process.env.OPENAI_API_KEY,
  });

  private readonly openai = new OpenAIApi(this.configuration);
  private model: Model | null = null;

  constructor(
    @InjectRepository(Prompt)
    private readonly _promptRepository: Repository<Prompt>,
  ) {}

  async getVariationsOf(
    locale: ELocale,
    word: string,
  ): Promise<OpenAIWordMeaningsDto | null> {
    const model = await this._init();

    if (!model) {
      throw new InternalServerErrorException(
        'There was a problem when trying to obtain the open api model',
      );
    }

    const prompt = await this._promptRepository.findOneBy({ locale });

    if (!prompt) {
      throw new InternalServerErrorException(
        `There is no prompt available for the locale: ${locale}`,
      );
    }

    const request: CreateChatCompletionRequest = {
      model: model.id,
      messages: [
        {
          role: 'system',
          content: prompt.value.replace(/\*\[word\]\*/, word),
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

  private async _init(): Promise<Model | null> {
    if (!this.model) {
      const response = await this.openai.retrieveModel(
        process.env.OPENAI_MODEL,
      );

      this.model = response.data;
    }

    return this.model;
  }
}
