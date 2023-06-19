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

export function onErrorToExit(error: unknown): never {
  const code = errorToCode(error);
  const exitCode = codeToExitCode(code);
  process.exit(exitCode);
}
