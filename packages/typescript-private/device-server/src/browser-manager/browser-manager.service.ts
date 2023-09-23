import { Injectable, OnModuleInit } from '@nestjs/common';
import { BrowserManager } from './browser-manager';

@Injectable()
export class BrowserManagerService extends BrowserManager implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.migrate();
  }
}
