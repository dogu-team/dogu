import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ScanModule } from '../scan/scan.module';
import { ProfileService } from './profile.service';

@Module({
  imports: [ScanModule, ConfigModule],
  providers: [ProfileService],
})
export class ProfileModule {}
