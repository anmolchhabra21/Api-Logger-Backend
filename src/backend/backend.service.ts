import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import moment from 'moment';

@Injectable()
export class BackendService {
  private client;
  private openai;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('GPT_KEY'),
    });
    this.client = createClient({
      host:
        this.configService.get<string>('CLICKHOUSE_HOST') ??
        'http://localhost:8123',
      username:
        this.configService.get<string>('CLICKHOUSE_USERNAME') ?? 'default',
      password: this.configService.get<string>('CLICKHOUSE_PASSWORD') ?? '',
    });
  }

  async insertdB(request: string) {
    const data = await this.testGPT(request);
    const test = await this.client.insert({
      table: 'gpt_response_db',
      // structure should match the desired format, JSONEachRow in this example
      values: [
        {
          request: request,
          model: data.model,
          status: true,
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          total_tokens: data.usage.total_tokens,
          response: data.choices[0].message.content,
          created_at: moment(data.created).format('YYYY-MM-DD HH:MM:SS'),
        },
      ],
      format: 'JSONEachRow',
    });
    console.log('1st entry', test);
    return test;
  }

  async testGPT(query: string) {
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'system', content: query }],
      model: 'gpt-3.5-turbo',
    });

    console.log(completion);
    return completion;
  }

  async getByDate(startDate: string, endDate: string) {
    try {
      console.log(startDate, endDate);
      const query = `
          SELECT *
          FROM gpt_response_db
          WHERE created_at >= toDateTime('${startDate}') AND created_at <= toDateTime('${endDate}');
          `;

      const result = await this.client.query({
        query: query,
        format: 'JSONEachRow',
      });
      const data = await result.json();
      return data;

    } catch (error) {
      // Handle errors
      console.error(error);
      throw error;
    }
  }
}
