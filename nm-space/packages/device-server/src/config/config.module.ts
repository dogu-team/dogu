import { Module } from '@nestjs/common';
import { ScanModule } from '../scan/scan.module';
import { ConfigService } from './config.service';

@Module({
  imports: [ScanModule],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
