import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ScanModule } from '../scan/scan.module';
import { DeviceInspectorController } from './device-inspector.controller';

@Module({
  imports: [ScanModule, AuthModule],
  controllers: [DeviceInspectorController],
})
export class DeviceInspectorModule {}
