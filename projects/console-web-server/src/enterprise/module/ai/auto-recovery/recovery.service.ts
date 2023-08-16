import { Injectable } from '@nestjs/common';

@Injectable()
export class RecoveryService {
  async captureScreen(scriptPath: string, image: string): Promise<void> {}

  async captureElement(scriptPath: string, elementPath: string, image: string): Promise<void> {}
}
