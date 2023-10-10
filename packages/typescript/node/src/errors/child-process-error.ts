import { BufferLogger, stringify } from '@dogu-tech/common';

export class ChildProcessError extends Error {
  constructor(
    public readonly command: string,
    public readonly code: number | null,
    public readonly signal: NodeJS.Signals | null,
    public readonly bufferLogger: BufferLogger | null,
  ) {
    const logInfos = bufferLogger?.sortedLogInfos() ?? [];
    const logDump =
      '\n>>> LOG DUMP start\n' +
      logInfos.map((log) => `${log.level}|${new Date(log.time).toISOString()}|${stringify(log.message)} ${stringify(log.details)}`).join('\n') +
      '\n>>> LOG DUMP end';
    super(`Child process error: ${command}, code: ${code ?? 0}, signal: ${signal ?? 'null'}, ${logDump}`);
  }
}
