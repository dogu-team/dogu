import { PlatformAbility } from '@dogu-private/dost-children';
import { Injectable, Module } from '@nestjs/common';
import { env } from '../env';

@Injectable()
export class PlatformAbilityService extends PlatformAbility {
  constructor() {
    super(env.DOGU_DEVICE_PLATFORM_ENABLED);
  }
}

@Module({
  providers: [PlatformAbilityService],
  exports: [PlatformAbilityService],
})
export class PlatformAbilityModule {}
