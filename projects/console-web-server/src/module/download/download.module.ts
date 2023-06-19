import { Module } from '@nestjs/common';
import { FileModule } from '../file/file.module';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';

@Module({
  imports: [FileModule],
  providers: [DownloadService],
  exports: [DownloadService],
  controllers: [DownloadController],
})
export class DownloadModule {}
