import { Module } from '@nestjs/common';
import { ConsoleClientModule } from '../console-client/console-client.module';
import { ProcessorModule } from '../processor/processor.module';
import { DeviceJobContextRegistry } from './device-job.context-registry';
import { DeviceJobLogProcessRegistry } from './device-job.device-log-process-registry';
import { DeviceJobHeartbeater } from './device-job.heartbeater';
import { DeviceJobLogger } from './device-job.logger';
import { DeviceJobRecordingProcessRegistry } from './device-job.recording-process-registry';
import { DeviceJobRecordingService } from './device-job.recording-service';
import { DeviceJobUpdater } from './device-job.updater';
import { DeviceJobWindowsProcessRegistry } from './device-job.windows-process-registry';

@Module({
  imports: [ConsoleClientModule, ProcessorModule],
  providers: [
    DeviceJobHeartbeater,
    DeviceJobUpdater,
    DeviceJobRecordingService,
    DeviceJobRecordingProcessRegistry,
    DeviceJobWindowsProcessRegistry,
    DeviceJobContextRegistry,
    DeviceJobLogProcessRegistry,
    DeviceJobLogger,
  ],
  exports: [DeviceJobContextRegistry, DeviceJobLogger],
})
export class DeviceJobModule {}
