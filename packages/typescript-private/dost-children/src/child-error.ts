import { Code } from '@dogu-private/types';

export class ChildError extends Error {
  constructor(public readonly code: Code, message: string, public readonly details?: Record<string, unknown>, options?: ErrorOptions) {
    super(message, options);
  }
}

export function isChildError(error: unknown): error is ChildError {
  return error instanceof ChildError;
}

export class ChildCode {
  constructor(readonly begin: Code) {}

  exitCode(code: Code): number {
    const exitCode = code - this.begin;
    this.validateExitCode(exitCode);
    return exitCode;
  }

  code(exitCode: number | null, signal?: string | null): Code {
    if (exitCode !== null) {
      this.validateExitCode(exitCode);
      return this.begin + exitCode;
    } else if (signal !== null && signal !== undefined) {
      return this.codeBySignal(signal);
    } else {
      throw new Error('Either exitCode or signal must be specified');
    }
  }

  private codeBySignal(signal: string): Code {
    switch (signal) {
      case 'SIGHUP':
        return this.begin + 301;
      case 'SIGINT':
        return this.begin + 302;
      case 'SIGQUIT':
        return this.begin + 303;
      case 'SIGILL':
        return this.begin + 304;
      case 'SIGTRAP':
        return this.begin + 305;
      case 'SIGABRT':
        return this.begin + 306;
      case 'SIGFPE':
        return this.begin + 308;
      case 'SIGKILL':
        return this.begin + 309;
      case 'SIGSEGV':
        return this.begin + 311;
      case 'SIGPIPE':
        return this.begin + 313;
      case 'SIGALRM':
        return this.begin + 314;
      case 'SIGTERM':
        return this.begin + 315;
      default:
        throw new Error(`Unknown signal: ${signal}`);
    }
  }

  private validateExitCode(exitCode: number): void {
    if (0 <= exitCode && exitCode <= 255) {
      return;
    }
    throw new Error(`Invalid exit code: ${exitCode}`);
  }
}
