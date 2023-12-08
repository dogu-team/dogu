import { Module } from '@nestjs/common';
import { UpdateTriggerService } from './update-trigger.service';

@Module({
  providers: [UpdateTriggerService],
})
export class UpdateTriggerModule {}
