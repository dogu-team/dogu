import { ILogger } from '../shares/log';
import { ipc } from './window';

class Logger implements ILogger {
  error(message: unknown, details?: Record<string, unknown>): void {
    console.error(...this.args(message, details));
    ipc.rendererLogger.error(message, details);
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    console.warn(...this.args(message, details));
    ipc.rendererLogger.warn(message, details);
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    console.info(...this.args(message, details));
    ipc.rendererLogger.info(message, details);
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    console.debug(...this.args(message, details));
    ipc.rendererLogger.debug(message, details);
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    console.debug(...this.args(message, details));
    ipc.rendererLogger.verbose(message, details);
  }

  private args(message: unknown, details?: Record<string, unknown>): unknown[] {
    const args = [message];
    if (details) {
      args.push(details);
    }
    return args;
  }
}

export const logger: ILogger = new Logger();
