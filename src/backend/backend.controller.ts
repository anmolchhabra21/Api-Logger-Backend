import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { BackendService } from './backend.service.js';
import * as moment from 'moment';

@Controller('backend')
export class BackendController {
  constructor(
    private configService: ConfigService,
    private backendservice: BackendService,
  ) {}
  @Get()
  test() {
    const test1 = this.configService.get<string>('CLICKHOUSE_USERNAME');
    return moment.unix(1707113455).format('YYYY-MM-DD HH:mm:ss');
  }
  @Post('db')
  async insertDb(@Body() body) {
    const book = await this.backendservice.insertdB(body.query, body.gptModel, body.user);
    return book;
  }
  @Post('gpt')
  async getByDate(@Body() body) {
    console.log("anml", body);
    if(!("startDate" in body) || !("endDate" in body)){
      body["startDate"] = moment().subtract(1, 'days');
      body["endDate"] = moment();
    }
    body["startDate"] = moment(body["startDate"]).format('YYYY-MM-DD HH:mm:ss');
    body["endDate"] = moment(body["endDate"]).format('YYYY-MM-DD HH:mm:ss');

    const book = await this.backendservice.getByDate(body["startDate"], body["endDate"]);
    return book;
  }
  @Get('gpt')
  async getHello(@Query('query') query: string) {
    if (query) {
      const book = await this.backendservice.testGPT(query);
      return book;
    } else {
      return 'Query Shouldnt be empty!';
    }
  }
}
