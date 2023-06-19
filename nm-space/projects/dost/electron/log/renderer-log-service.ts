import { ipcMain } from 'electron';
import { ILogger, rendererLoggerKey } from '../../src/shares/log';
import { rendererLogger } from './logger.instance';

export class RendererLogService implements ILogger {
  static instance: RendererLogService;

  static open(): void {
    RendererLogService.instance = new RendererLogService();
    const { instance } = RendererLogService;
    ipcMain.on(rendererLoggerKey.error, (event, message: unknown, details?: Record<string, unknown>) => instance.error(message, details));
    ipcMain.on(rendererLoggerKey.warn, (event, message: unknown, details?: Record<string, unknown>) => instance.warn(message, details));
    ipcMain.on(rendererLoggerKey.info, (event, message: unknown, details?: Record<string, unknown>) => instance.info(message, details));
    ipcMain.on(rendererLoggerKey.debug, (event, message: unknown, details?: Record<string, unknown>) => instance.debug(message, details));
    ipcMain.on(rendererLoggerKey.verbose, (event, message: unknown, details?: Record<string, unknown>) => instance.verbose(message, details));
  }

  private rendererLogger = rendererLogger;

  error(message: unknown, details?: Record<string, unknown>): void {
    this.rendererLogger.error(message, details);
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    this.rendererLogger.warn(message, details);
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    this.rendererLogger.info(message, details);
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    this.rendererLogger.debug(message, details);
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    this.rendererLogger.verbose(message, details);
  }
}
