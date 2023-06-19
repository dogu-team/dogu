import { IsFilledString, IsOptionalObject } from '@dogu-tech/common';
import { IsEnum } from 'class-validator';
import { Code, ErrorResult } from './protocol/generated/tsproto/outer/errors';

export class CodeUtil {
  static readonly Success = Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED;

  static isSuccess(code?: Code): boolean {
    if (code === undefined) {
      return false;
    }
    return code === CodeUtil.Success;
  }

  static isNotSuccess(code?: Code): boolean {
    return !CodeUtil.isSuccess(code);
  }
}

export class ErrorResultError extends Error implements ErrorResult {
  code: Code;
  details?: Record<string, unknown>;

  static readonly None = new ErrorResultError(Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED, '');

  constructor(code: Code, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function isErrorResultError(error: unknown): error is ErrorResultError {
  return error instanceof ErrorResultError;
}

export class ErrorResultDto implements ErrorResult {
  @IsEnum(Code)
  code!: Code;

  @IsFilledString()
  message!: string;

  @IsOptionalObject()
  details?: Record<string, unknown>;
}
