import { Module } from '@nestjs/common';
import { DateTimeSimulatorService } from './date-time-simulator.service';
import { DateTimeSimulatorSubscriber } from './date-time-simulator.subscriber';

@Module({
  providers: [DateTimeSimulatorService, DateTimeSimulatorSubscriber],
  exports: [DateTimeSimulatorService],
})
export class DateTimeSimulatorModule {}
