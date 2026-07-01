import { Module } from '@nestjs/common';
import { ResponsesResolver } from './responses.resolver';
import { ResponsesService } from './responses.service';

@Module({
  providers: [ResponsesResolver, ResponsesService],
})
export class ResponsesModule {}
