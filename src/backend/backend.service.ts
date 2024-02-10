import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as moment from 'moment';

@Injectable()
export class BackendService {
  private client;
  private openai;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('GPT_KEY'),
    });
    this.client = createClient({
      host: this.configService.get<string>('CLICKHOUSE_HOST') ?? 'http://localhost:8123',
      username: this.configService.get<string>('CLICKHOUSE_USERNAME') ?? 'default',
      password: this.configService.get<string>('CLICKHOUSE_PASSWORD') ?? '',
    });
  }

  private formatDate(timestamp: number): string {
    return moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
  }

  async insertIntoDB(request: string, gptModel: string, user: string, status: boolean, data: any): Promise<any> {
    try {
      return await this.client.insert({
        table: 'gpt_response_db',
        values: [
          {
            request: request,
            model: gptModel,
            status: status,
            prompt_tokens: status ? data.usage.prompt_tokens : 0,
            completion_tokens: status ? data.usage.completion_tokens : 0,
            total_tokens: status ? data.usage.total_tokens : 0,
            response: status ? data.choices[0].message.content : "Failed to generate response.",
            created_at: this.formatDate(status ? data.created : Math.floor(Date.now() / 1000)),
            user: user,
          },
        ],
        format: 'JSONEachRow',
      });
    } catch (insertError) {
      console.error(insertError);
    }
  }

  async generateResponseAndInsertIntoDB(request: string, gptModel: string, user: string): Promise<any> {
    try {
      const data = await this.generateGptResponse(request);
      const test = await this.insertIntoDB(request, gptModel, user, true, data);
      return {test, data};
    } catch (gptError) {
      console.error(gptError);
      await this.insertIntoDB(request, gptModel, user, false, null);
      throw gptError;
    }
  }

  async generateGptResponse(query: string): Promise<any> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: 'system', content: query }],
        model: 'gpt-3.5-turbo',
      });
      return completion;
    } catch (error) {
      console.error(error);
      throw new Error('gptError');
    }
  }

  async fetchRecordsByDateRange(startDate: string, endDate: string): Promise<any> {
    try {
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
      console.error(error);
      throw error;
    }
  }
}