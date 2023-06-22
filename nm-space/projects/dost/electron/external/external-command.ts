import { PromiseOrValue } from '@dogu-tech/common';
import { ExternalCommandKey, ExternalValidationResult } from '../../src/shares/external';

export interface ExternalCommandCallback {
  onCommandStarted: () => void;
  onCommandInProgress: () => void;
  onCommandCompleted: () => void;
}

export abstract class IExternalCommand {
  protected _lastValidationResult: ExternalValidationResult | null = null;
  protected canceler: (() => void) | null = null;

  get lastValidationResult(): ExternalValidationResult | null {
    return this._lastValidationResult;
  }

  async validate(): Promise<void> {
    this._lastValidationResult = await Promise.resolve(this.validateInternal())
      .then(() => {
        return {
          valid: true,
          error: null,
        };
      })
      .catch((error) => {
        return {
          valid: false,
          error,
        };
      });
  }

  isValid(): boolean {
    return this._lastValidationResult?.valid ?? false;
  }

  isInstallNeeded(): boolean {
    return !this.isValid();
  }

  abstract getKey(): ExternalCommandKey;
  abstract getName(): string;
  abstract isPlatformSupported(): boolean;
  abstract validateInternal(): PromiseOrValue<void>;
  abstract run(): PromiseOrValue<void>;
  abstract cancel(): PromiseOrValue<void>;
}
