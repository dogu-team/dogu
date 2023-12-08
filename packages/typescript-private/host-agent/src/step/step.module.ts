import { Module } from '@nestjs/common';
import { ConsoleClientModule } from '../console-client/console-client.module';
import { StepUpdater } from './step.updater';

@Module({
  imports: [ConsoleClientModule],
  providers: [StepUpdater],
})
export class StepModule {}
