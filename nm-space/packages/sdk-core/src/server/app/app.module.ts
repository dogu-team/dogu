import { Module } from '@nestjs/common';
import { PytestModule } from '../pytest/pytest.module.js';

@Module({
  imports: [PytestModule],
})
export class AppModule {}
