import { Module } from '@nestjs/common';
import { DateTimeSimulatorService } from './date-time-simulator.service';

@Module({
  providers: [DateTimeSimulatorService],
  exports: [DateTimeSimulatorService],
})
export class DateTimeSimulatorModule {}
