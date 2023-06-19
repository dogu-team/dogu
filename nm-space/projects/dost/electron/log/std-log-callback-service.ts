import { stdLogCallbackKey } from '../../src/shares/log';
import { WindowService } from '../window/window-service';

export class StdLogCallbackService {
  static instance: StdLogCallbackService;

  static open(windowService: WindowService): void {
    StdLogCallbackService.instance = new StdLogCallbackService(windowService);
  }

  private constructor(private readonly windowService: WindowService) {}

  stdout(message: string): void {
    const { windowService } = this;
    windowService.window?.webContents.send(stdLogCallbackKey.onStdout, message);
  }

  stderr(message: string): void {
    const { windowService } = this;
    windowService.window?.webContents.send(stdLogCallbackKey.onStderr, message);
  }
}
