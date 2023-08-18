import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device, RecordTestScenarioAndRecordTestCase } from '../../../db/entity/index';
import { RecordTestCase } from '../../../db/entity/record-test-case.entity';
import { RecordTestScenario } from '../../../db/entity/record-test-scenario.entity';
import { RecordTestStepActionWebdriverClick } from '../../../db/entity/record-test-step-action-webdriver-click.entity';
import { RecordTestStep } from '../../../db/entity/record-test-step.entity';
import { DeviceMessageModule } from '../../../module/device-message/device-message.module';
import { FileModule } from '../../../module/file/file.module';
import { ProjectModule } from '../../../module/project/project.module';
import { RemoteModule } from '../../../module/remote/remote.module';
import { RecordTestStepActionWebdriverClickService } from './record-test-action/record-test-action-webdriver-click.service';
import { RecordTestStepActionService } from './record-test-action/record-test-step-action.service';
import { RecordTestCaseController } from './record-test-case/record-test-case.controller';
import { RecordTestCaseService } from './record-test-case/record-test-case.service';
import { RecordTestScenarioController } from './record-test-scenario/record-test-scenario.controller';
import { RecordTestScenarioService } from './record-test-scenario/record-test-scenario.service';
import { RecordTestStepController } from './record-test-step/record-test-step.controller';
import { RecordTestStepService } from './record-test-step/record-test-step.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecordTestScenario, RecordTestCase, RecordTestStep, RecordTestScenarioAndRecordTestCase, Device, RecordTestStepActionWebdriverClick]),
    RemoteModule,
    FileModule,
    ProjectModule,
    DeviceMessageModule,
  ],
  providers: [RecordTestScenarioService, RecordTestCaseService, RecordTestStepService, RecordTestStepActionService, RecordTestStepActionWebdriverClickService],
  exports: [],
  controllers: [RecordTestScenarioController, RecordTestCaseController, RecordTestStepController],
})
export class RecordModule {}
