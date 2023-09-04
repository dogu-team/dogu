import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device, RecordTestScenarioAndRecordTestCase } from '../../../db/entity/index';
import { RecordCaseAction } from '../../../db/entity/record-case-action.entity';
import { RecordDeviceJob } from '../../../db/entity/record-device-job.entity';
import { RecordPipeline } from '../../../db/entity/record-pipeline.entity';
import { RecordStepAction } from '../../../db/entity/record-step-action.entity';
import { RecordTestCase } from '../../../db/entity/record-test-case.entity';
import { RecordTestScenario } from '../../../db/entity/record-test-scenario.entity';
import { RecordTestStep } from '../../../db/entity/record-test-step.entity';
import { DeviceMessageModule } from '../../../module/device-message/device-message.module';
import { FileModule } from '../../../module/file/file.module';
import { ProjectModule } from '../../../module/project/project.module';
import { RemoteModule } from '../../../module/remote/remote.module';
import { RecordPipelineController } from './pipeline/record-pipeline.controller';
import { RecordPipelineService } from './pipeline/record-pipeline.service';
import { RecordTestStepActionWebdriverClickService } from './record-test-action/record-test-action-webdriver-click.service';
import { RecordTestStepActionWebdriverInputService } from './record-test-action/record-test-action-webdriver-input.service';
import { RecordTestStepActionService } from './record-test-action/record-test-step-action.service';
import { RecordTestCaseController } from './record-test-case/record-test-case.controller';
import { RecordTestCaseService } from './record-test-case/record-test-case.service';
import { RecordTestScenarioController } from './record-test-scenario/record-test-scenario.controller';
import { RecordTestScenarioService } from './record-test-scenario/record-test-scenario.service';
import { RecordTestStepController } from './record-test-step/record-test-step.controller';
import { RecordTestStepService } from './record-test-step/record-test-step.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecordTestScenario,
      RecordTestCase,
      RecordTestStep,
      RecordTestScenarioAndRecordTestCase,
      Device,
      RecordPipeline,
      RecordDeviceJob,
      RecordCaseAction,
      RecordStepAction,
    ]),
    RemoteModule,
    FileModule,
    ProjectModule,
    DeviceMessageModule,
  ],
  providers: [
    RecordTestScenarioService,
    RecordTestCaseService,
    RecordTestStepService,
    RecordTestStepActionService,
    RecordTestStepActionWebdriverClickService,
    RecordTestStepActionWebdriverInputService,
    RecordPipelineService,
  ],
  exports: [],
  controllers: [RecordTestScenarioController, RecordTestCaseController, RecordTestStepController, RecordPipelineController],
})
export class RecordModule {}
