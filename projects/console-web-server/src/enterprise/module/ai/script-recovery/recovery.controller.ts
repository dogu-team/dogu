import { Controller, Post } from '@nestjs/common';

import { RecoveryService } from './recovery.service';

@Controller('/recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Post('/capture/screen')
  async captureScreen(platform: string, scriptPath: string, image: string): Promise<void> {
    await this.recoveryService.captureScreen(scriptPath, image);
  }

  @Post('/capture/element')
  async captureElement(platform: string, scriptPath: string, elementPath: string, image: string): Promise<void> {
    await this.recoveryService.captureElement(scriptPath, elementPath, image);
  }
}
