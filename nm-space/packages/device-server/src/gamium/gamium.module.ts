import { Module } from '@nestjs/common';
import { GamiumService } from './gamium.service';

@Module({
  providers: [GamiumService],
  exports: [GamiumService],
})
export class GamiumModule {}
