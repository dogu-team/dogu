import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { DeviceAuthModule } from '../device-auth/device-auth.module';
import { DeviceClientModule } from '../device-client/device-client.module';
import { DeviceJobModule } from '../device-job/device-job.module';
import { ActionProcessor } from './action.processor';
import { CommandProcessRegistry } from './command.process-registry';
import { DeviceJobStepProcessor } from './device-job-step.processor';
import { DockerActionProcessor } from './docker-action.processor';
import { RoutineWorkspace } from './routine.workspace';
import { UpdateProcessor } from './update.processor';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({}),
    }),
    forwardRef(() => DeviceJobModule),
    DeviceClientModule,
    DeviceAuthModule,
  ],
  providers: [ActionProcessor, CommandProcessRegistry, DeviceJobStepProcessor, RoutineWorkspace, UpdateProcessor, DockerActionProcessor],
  exports: [ActionProcessor, CommandProcessRegistry, DeviceJobStepProcessor, RoutineWorkspace, UpdateProcessor, DockerActionProcessor],
})
export class ProcessorModule {}
