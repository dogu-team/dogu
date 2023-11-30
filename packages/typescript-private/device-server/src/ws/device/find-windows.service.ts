import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { categoryFromPlatform, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, DuplicatedCallGuarder, errorify, Instance } from '@dogu-tech/common';
import { DeviceFindWindows } from '@dogu-tech/device-client-common';
import { getChildProcessIds, getProcessesMapMacos } from '@dogu-tech/node';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { AuthIncomingMessage, DeviceWsPermission } from '../../auth/guard/device.ws.guard';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

interface Value {
  serial: Serial;
  parentPid: number;
  timer: NodeJS.Timer | null;
  updateGuard: DuplicatedCallGuarder;
}

@WebSocketService(DeviceFindWindows)
export class DeviceFindWindowsService
  extends WebSocketGatewayBase<Value, typeof DeviceFindWindows.sendMessage, typeof DeviceFindWindows.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceFindWindows.sendMessage, typeof DeviceFindWindows.receiveMessage>, OnWebSocketClose<Value>
{
  constructor(
    private readonly scanService: ScanService,
    private readonly logger: DoguLogger,
  ) {
    super(DeviceFindWindows, logger);
  }

  @DeviceWsPermission({ allowAdmin: true, allowTemporary: 'serial' })
  override onWebSocketOpen(webSocket: WebSocket, @AuthIncomingMessage() incommingMessage: IncomingMessage): Value {
    return { serial: '', parentPid: 0, timer: null, updateGuard: new DuplicatedCallGuarder() };
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceFindWindows.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { updateGuard } = valueAccessor.get();
    const { serial, parentPid, isSafari } = message;
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${serial} not found`);
    }

    const categoryPlatform = categoryFromPlatform(platformTypeFromPlatform(deviceChannel.platform));
    if (categoryPlatform !== 'desktop') {
      throw new Error(`Device with serial ${serial} is not desktop`);
    }

    const timer = setInterval(() => {
      updateGuard
        .guard(async () => {
          const deviceChannel = this.scanService.findChannel(serial);
          if (deviceChannel === null) {
            throw new Error(`Device with serial ${serial} not found`);
          }
          const windows = await deviceChannel.getWindows();
          const childProcess = await getChildProcessIds(parentPid, this.logger);
          if (isSafari && process.platform === 'darwin') {
            const procs = await getProcessesMapMacos(this.logger);
            const safariProc = Array.from(procs).find((proc) => proc[1].commandLine.includes('Safari.app/Contents/MacOS/Safari'));
            if (safariProc) {
              childProcess.push(safariProc[0]);
            }
          }
          const targetWindow = windows.find((window) => childProcess.includes(window.pid));
          if (!targetWindow) {
            return;
          }
          this.send(webSocket, {
            pid: targetWindow.pid,
            width: targetWindow.width,
            height: targetWindow.height,
          });
          await Promise.resolve();
        })
        .catch((error) => {
          this.logger.error('Failed to find windows', { error: errorify(error) });
        });
    }, 1000);
    valueAccessor.update({ serial, parentPid, timer, updateGuard });
    await Promise.resolve();
  }

  async onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { timer } = valueAccessor.get();
    if (timer) {
      clearInterval(timer);
    }
    closeWebSocketWithTruncateReason(webSocket, 1000, 'Finding windows finished');
    await Promise.resolve();
  }
}
