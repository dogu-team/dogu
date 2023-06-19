import { BufferLogger, PrefixLevelConsoleLogger, Printable } from '@dogu-tech/common';
import { fillReportOptions, ReportOptions } from './options';
import { ConsoleReporter, NullReporter, Reporter } from './reporter';

export class ReporterFactory {
  constructor(private readonly printable: Printable, private readonly options?: ReportOptions) {}

  async create(): Promise<Reporter> {
    const reporterLogger = new PrefixLevelConsoleLogger('[dest-report]', 'info');
    const bufferLogger = new BufferLogger();
    try {
      const filledOptions = await fillReportOptions(bufferLogger, this.options);
      reporterLogger.level = filledOptions.DOGU_LOG_LEVEL;
      return new ConsoleReporter(filledOptions, reporterLogger);
    } catch (error) {
      this.printable.verbose?.('Failed to load step reporter env', { logs: bufferLogger.buffers, error });
      return new NullReporter();
    }
  }
}
