import { Module } from '@nestjs/common';
import { BackendController } from './backend.controller';
import { ConfigModule } from '@nestjs/config';
import { BackendService } from './backend.service';

@Module({
  imports: [ConfigModule],
  controllers: [BackendController],
  providers: [BackendService],
})
export class BackendModule {}
