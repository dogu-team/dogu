import { Module } from '@nestjs/common';
import { ConsoleClientModule } from '../console-client/console-client.module';
import { ProcessorModule } from '../processor/processor.module';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';

@Module({
  imports: [ConsoleClientModule, ProcessorModule],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
