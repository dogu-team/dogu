import { Module } from '@nestjs/common';
import { PytestGateway } from './pytest.gateway.js';

@Module({
  providers: [PytestGateway],
})
export class PytestModule {}
