import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { BackendService } from './backend.service.js';

@Controller('backend')
export class BackendController {
    constructor(private configService: ConfigService, private backendservice: BackendService) {}
// @Post('query')
// async query(@Body() requestBody: any): Promise<any> {
//     try{
//         const openaiResponse = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
//             prompt: requestBody.prompt,
//         });

//         const requestData = {
//             prompt: requestBody.prompt,
//             tokensCount: openaiResponse.data.choices[0].usage.total_tokens,
//             responseLatency: openaiResponse.headers['x-response-time'],
//             metadata: requestBody.metadata,
//             success: true,
//         };
//         logToClickhouse(requestData);

//         return openaiResponse.data;
//     } catch (error) {
//         // Handle errors
//         const requestData = {
//           prompt: requestBody.prompt,
//           tokensCount: 0,
//           responseLatency: 0,
//           metadata: requestBody.metadata,
//           success: false,
//         };
//         logToClickhouse(requestData);
    
//         throw new Error('Internal Server Error');
//       }
//     }
// }
    @Get()
    test() {
        const test1 = this.configService.get<string>('CLICKHOUSE_USERNAME');
        return "Hello from here " + test1;
    }
    @Post('db')
    async insertDb(@Body() body) {
        const book = await this.backendservice.insertdB(body.query);
        return book;
    }
    // @Get('Testdb')
    // async testDb() {
    //     const book = await this.backendservice.testGPT();
    //     return book;
    // }
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
