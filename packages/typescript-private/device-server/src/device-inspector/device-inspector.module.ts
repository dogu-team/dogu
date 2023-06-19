import { Module } from '@nestjs/common';
import { ScanModule } from '../scan/scan.module';
import { DeviceInspectorController } from './device-inspector.controller';

@Module({
  imports: [ScanModule],
  controllers: [DeviceInspectorController],
})
export class DeviceInspectorModule {}
