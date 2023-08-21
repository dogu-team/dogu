import EventEmitter from 'events';
import { createLogger } from './logger.js';

interface Terminateable {
  on(event: 'terminate', listener: () => void): this;
  once(event: 'terminate', listener: () => void): this;
  emit(event: 'terminate'): boolean;
}

export class Terminator extends EventEmitter implements Terminateable {
  private readonly logger = createLogger(Terminator);
  private isTerminated = false;

  override emit(event: 'terminate'): boolean {
    if (this.isTerminated) {
      return true;
    }
    this.isTerminated = true;
    this.logger.verbose('emit terminate');
    const result = super.emit(event);
    this.logger.verbose('emit terminate done');
    return result;
  }
}
