import { Injectable } from '@nestjs/common';
import { DeviceChannel } from '../internal/public/device-channel';
import { GamiumContext, GamiumContextOptions } from './gamium.context';

@Injectable()
export class GamiumService {
  openGamiumContext(channel: DeviceChannel, options?: GamiumContextOptions): GamiumContext {
    const gamiumContext = new GamiumContext(channel, options);
    gamiumContext.open();
    return gamiumContext;
  }
}
