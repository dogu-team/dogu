import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordTestCaseAndRecordTestStep, RecordTestScenarioAndRecordTestCase } from '../../../db/entity/index';
import { RecordTestCase } from '../../../db/entity/record-test-case.entity';
import { RecordTestScenario } from '../../../db/entity/record-test-scenario.entity';
import { RecordTestStep } from '../../../db/entity/record-test-step.entity';
import { RecordTestCaseController } from './record-test-case/record-test-case.controller';
import { RecordTestCaseService } from './record-test-case/record-test-case.service';
import { RecordTestScenarioController } from './record-test-scenario/record-test-scenario.controller';
import { RecordTestScenarioService } from './record-test-scenario/record-test-scenario.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecordTestScenario, RecordTestCase, RecordTestStep, RecordTestScenarioAndRecordTestCase, RecordTestCaseAndRecordTestStep])],
  providers: [RecordTestScenarioService, RecordTestCaseService],
  exports: [],
  controllers: [RecordTestScenarioController, RecordTestCaseController],
})
export class RecordModule {}
