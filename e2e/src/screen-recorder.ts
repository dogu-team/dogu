import { ConsoleLogger, Printable, PromiseOrValue, stringify } from '@dogu-tech/common';
import { ChildProcess, exec, spawn } from 'child_process';
import ON_DEATH from 'death';
import lodash from 'lodash';

export interface ScreenRecordOptions {
  /**
   * @default 'ffmpeg'
   */
  ffmpegPath?: string;

  /**
   * @default 'output.mp4'
   */
  outputPath?: string;

  /**
   * @default process.platform
   */
  platform?: NodeJS.Platform;

  /**
   * @default ConsoleLogger.instance
   */
  printable?: Printable;

  /**
   * @default 30
   */
  fps?: number;

  /**
   * @default 0.015625
   */
  timeScale?: number;

  /**
   * @default true
   * @description stop recording when process exits
   */
  stopOnExit?: boolean;
}

type FilledScreenRecordOptions = Required<ScreenRecordOptions>;

function defaultScreenRecordOptions(): FilledScreenRecordOptions {
  return {
    ffmpegPath: 'ffmpeg',
    outputPath: 'output.webm',
    platform: process.platform,
    printable: ConsoleLogger.instance,
    fps: 30,
    timeScale: 0.015625,
    stopOnExit: true,
  };
}

function fillScreenRecordOptions(options?: ScreenRecordOptions): FilledScreenRecordOptions {
  return lodash.merge(defaultScreenRecordOptions(), options);
}

interface ScreenRecorderArgs {
  args(): PromiseOrValue<string[]>;
}

class WindowsScreenRecorderArgs implements ScreenRecorderArgs {
  constructor(private readonly options: FilledScreenRecordOptions) {}

  args(): string[] {
    const { fps, timeScale, outputPath } = this.options;
    return [
      '-y',
      '-f',
      'gdigrab',
      '-itsscale',
      `${timeScale}`,
      '-i',
      'desktop',
      '-preset',
      'ultrafast',
      '-crf',
      '28',
      '-vcodec',
      'libvpx',
      '-r',
      `${fps}`,
      '-pix_fmt',
      'yuv420p',
      '-vf',
      'scale=trunc(oh*a/2)*2:480',
      '-deadline',
      'realtime',
      outputPath,
    ];
  }
}

class MacosScreenRecorderArgs implements ScreenRecorderArgs {
  constructor(private readonly options: FilledScreenRecordOptions) {}

  async args(): Promise<string[]> {
    const deviceIndex = await this.findScreenCaptureDeviceIndex();
    const { fps, timeScale, outputPath } = this.options;
    return [
      '-y',
      '-f',
      'avfoundation',
      '-itsscale',
      `${timeScale}`,
      '-i',
      deviceIndex,
      '-preset',
      'ultrafast',
      '-crf',
      '28',
      '-vcodec',
      'libvpx',
      '-r',
      `${fps}`,
      '-pix_fmt',
      'yuv420p',
      '-vf',
      'scale=trunc(oh*a/2)*2:480',
      '-deadline',
      'realtime',
      outputPath,
    ];
  }

  private async findScreenCaptureDeviceIndex(): Promise<string> {
    return new Promise((resolve, reject) => {
      const { ffmpegPath, printable } = this.options;
      const command = `${ffmpegPath} -f avfoundation -list_devices true -i ""`;
      exec(command, (error, stdout, stderr) => {
        const lines = stderr.split('\n');
        printable.debug?.('Screen capture device list', { command, lines });
        const screenCaptureLine = lines.find((line) => line.includes('Capture screen'));
        if (!screenCaptureLine) {
          reject(new Error('Screen capture device not found'));
          return;
        }
        const [, deviceIndex] = screenCaptureLine.match(/\[(\d+)\]/) || [];
        if (!deviceIndex) {
          reject(new Error('Screen capture device not found'));
          return;
        }
        resolve(deviceIndex);
      });
    });
  }
}

class ScreenRecorderArgsFactory {
  constructor(private readonly options: FilledScreenRecordOptions) {}

  create(): ScreenRecorderArgs {
    const { options } = this;
    const { platform } = options;
    switch (platform) {
      case 'win32':
        return new WindowsScreenRecorderArgs(options);
      case 'darwin':
        return new MacosScreenRecorderArgs(options);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

export class ScreenRecordStopper {
  private stopRequested = false;

  constructor(private readonly child: ChildProcess, private readonly printable: Printable) {}

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      const { child, printable, stopRequested } = this;
      if (stopRequested) {
        printable.info('Screen recorder already stop requested');
        resolve();
        return;
      }
      let errorOccurred: Error | null = null;
      child.once('error', (error) => {
        errorOccurred = error;
      });
      child.once('close', (code, signal): void => {
        if (errorOccurred) {
          reject(errorOccurred);
        } else if (code) {
          if (code === 255) {
            printable.info('Screen recorder stopped with code 255');
            resolve();
          } else {
            reject(new Error(`ffmpeg exited with code ${code}`));
          }
        } else if (signal) {
          if (signal === 'SIGINT') {
            printable.info('Screen recorder stopped with SIGINT');
            resolve();
          } else {
            reject(new Error(`ffmpeg exited with signal ${signal}`));
          }
        } else {
          reject(new Error(`Unexpected ffmpeg exit ${stringify(code)} ${stringify(signal)}`));
        }
      });
      this.stopRequested = true;
      child.kill('SIGINT');
      printable.info('Stopping screen recorder...');
    });
  }
}

const stopOnExitRegistry = new Set<ScreenRecordStopper>();
const OFF_DEATH = ON_DEATH(() => {
  (async (): Promise<void> => {
    console.log('Stopping screen recorders...');
    await Promise.all([...stopOnExitRegistry].map((stopper) => stopper.stop()));
    stopOnExitRegistry.clear();
    console.log('Screen recorders stopped');
  })().catch((error) => {
    console.error('Error while stopping screen recorders', error);
  });
  OFF_DEATH();
});

export class ScreenRecorder {
  async start(options?: ScreenRecordOptions): Promise<ScreenRecordStopper> {
    const filledOptions = fillScreenRecordOptions(options);
    const { ffmpegPath, stopOnExit, printable } = filledOptions;
    printable.info('Starting screen recorder...');
    const argsCreator = new ScreenRecorderArgsFactory(filledOptions).create();
    const args = await argsCreator.args();
    return new Promise((resolve, reject) => {
      const child = spawn(ffmpegPath, args);
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        printable.debug?.('ffmpeg stdout', { data: stringify(data) });
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        printable.debug?.('ffmpeg stderr', { data: stringify(data) });
      });
      let errorOccurred: Error | null = null;
      const onError = (error: Error): void => {
        errorOccurred = error;
      };
      child.once('error', onError);
      const onClose = (code?: number, signal?: NodeJS.Signals): void => {
        if (errorOccurred) {
          reject(errorOccurred);
        } else if (code) {
          reject(new Error(`ffmpeg exited with code ${code}`));
        } else if (signal) {
          reject(new Error(`ffmpeg exited with signal ${signal}`));
        } else {
          reject(new Error(`Unexpected ffmpeg exit ${stringify(code)} ${stringify(signal)}`));
        }
      };
      child.once('close', onClose);
      const onSpawn = (): void => {
        child.off('error', onError);
        child.off('close', onClose);
        const stopper = new ScreenRecordStopper(child, printable);
        if (stopOnExit) {
          child.once('close', () => {
            stopOnExitRegistry.delete(stopper);
            printable.info('Screen recorder deleted from stop on exit registry');
          });
          stopOnExitRegistry.add(stopper);
          printable.info('Screen recorder added to stop on exit registry');
        }
        printable.info('Screen recorder started', { command: child.spawnargs.join(' ') });
        resolve(stopper);
      };
      child.once('spawn', onSpawn);
    });
  }
}
