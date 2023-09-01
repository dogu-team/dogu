import { IsFilledString, IsOptionalObject } from '../common/decorators.js';

export class ErrorResultDto {
  @IsFilledString()
  message!: string;

  @IsOptionalObject()
  details?: Record<string, unknown>;
}
