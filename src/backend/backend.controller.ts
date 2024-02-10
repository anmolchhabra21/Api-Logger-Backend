import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { BackendService } from './backend.service.js';
import * as moment from 'moment';

@Controller('backend')
export class BackendController {
  constructor(
    private backendservice: BackendService,
  ) {}

  // This function returns a formatted date string for a specific Unix timestamp, just checking like ping-pong, request-response
  @Get()
  getFormattedDate() {
    return moment.unix(1707113455).format('YYYY-MM-DD HH:mm:ss');
  }

  // This function inserts a new record into the database
  @Post('db')
  async insertRecordIntoDb(@Body() body) {
    try {   
      const book = await this.backendservice.generateResponseAndInsertIntoDB(
        body.query,
        body.gptModel,
        body.user,
      );
      return book;
    } catch (error) {
      // handle error
      console.error('Error inserting record into database', error);
      return;
    }
  }

  // This function fetches records from the database within a specific date range
  @Post('gpt')
  async fetchRecordsByDate(@Body() body: any) {
    if (typeof body !== 'object' || body === null) {
      // handle invalid body
      console.error('Invalid body', body);
      return;
    }

    if (!('startDate' in body) || !('endDate' in body)) {
      body['startDate'] = moment().subtract(1, 'days');
      body['endDate'] = moment();
    }

    body['startDate'] = moment(body['startDate']).format('YYYY-MM-DD HH:mm:ss');
    body['endDate'] = moment(body['endDate']).format('YYYY-MM-DD HH:mm:ss');

    try {
      const book = await this.backendservice.fetchRecordsByDateRange(
        body['startDate'],
        body['endDate'],
      );
      return book;
    } catch (error) {
      // handle error
      console.error('Error fetching records by date range', error);
      return;
    }
  }

  // This function generates a GPT response based on the provided query
  @Get('gpt')
  async generateGptResponse(@Query('query') query: string) {
    if (query) {
      try {
        const book = await this.backendservice.generateGptResponse(query);
        return book;
      } catch (error) {
        // handle error
        console.error('Error generating GPT response', error);
        return;
      }
    } else {
      return { message: 'Query Shouldnt be empty!' };
    }
  }
}
