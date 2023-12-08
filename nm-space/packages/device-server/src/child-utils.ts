import { ChildCode, isChildError } from '@dogu-private/dost-children';
import { Code } from '@dogu-private/types';
import { isEnvValidationError } from '@dogu-tech/env-tools';

function errorToCode(error: unknown): Code {
  if (isEnvValidationError(error)) {
    return Code.CODE_DEVICE_SERVER_INVALID_ENV;
  } else if (isChildError(error)) {
    const { code } = error;
    return code;
  } else {
    return Code.CODE_DEVICE_SERVER_UNEXPECTED_ERROR;
  }
}

function codeToExitCode(code: Code): number {
  const childCode = new ChildCode(Code.CODE_DEVICE_SERVER_SUCCESS_BEGIN);
  return childCode.exitCode(code);
}

const ExitWaitTimeForCrashReport = 1000;
export function onErrorToExit(error: unknown): void {
  const code = errorToCode(error);
  const exitCode = codeToExitCode(code);
  setTimeout(() => {
    // give crash reporter some time to send the report
    process.exit(exitCode);
  }, ExitWaitTimeForCrashReport);
}
