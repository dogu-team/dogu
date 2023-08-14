import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device, RecordTestScenarioAndRecordTestCase } from '../../../db/entity/index';
import { RecordTestCase } from '../../../db/entity/record-test-case.entity';
import { RecordTestScenario } from '../../../db/entity/record-test-scenario.entity';
import { RecordTestStep } from '../../../db/entity/record-test-step.entity';
import { FeatureFileModule } from '../../../module/feature/file/feature-file.module';
import { ProjectModule } from '../../../module/project/project.module';
import { RemoteModule } from '../../../module/remote/remote.module';
import { RecordTestCaseController } from './record-test-case/record-test-case.controller';
import { RecordTestCaseService } from './record-test-case/record-test-case.service';
import { RecordTestScenarioController } from './record-test-scenario/record-test-scenario.controller';
import { RecordTestScenarioService } from './record-test-scenario/record-test-scenario.service';
import { RecordTestStepController } from './record-test-step/record-test-step.controller';
import { RecordTestStepService } from './record-test-step/record-test-step.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecordTestScenario, RecordTestCase, RecordTestStep, RecordTestScenarioAndRecordTestCase, Device]),
    RemoteModule,
    FeatureFileModule,
    ProjectModule,
  ],
  providers: [RecordTestScenarioService, RecordTestCaseService, RecordTestStepService],
  exports: [],
  controllers: [RecordTestScenarioController, RecordTestCaseController, RecordTestStepController],
})
export class RecordModule {}
