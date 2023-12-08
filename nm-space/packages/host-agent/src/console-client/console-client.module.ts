import { Module } from '@nestjs/common';
import { ConsoleClientService } from './console-client.service';

@Module({
  providers: [ConsoleClientService],
  exports: [ConsoleClientService],
})
export class ConsoleClientModule {}
