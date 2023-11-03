import { Module } from '@nestjs/common';
import { TestExecutorController } from './test-executor.controller';
import { TestExecutorService } from './test-executor.service';

@Module({
  imports: [],
  controllers: [TestExecutorController],
  providers: [TestExecutorService],
})
export class TestExecutorModule {}
