import { PromiseOrValue } from '@dogu-tech/common';
import { DownloadProgress, ExternalKey, ExternalValidationResult } from '../../src/shares/external';

export interface ExternalUnitCallback {
  onDownloadStarted: () => void;
  onDownloadInProgress: (progress: DownloadProgress) => void;
  onDownloadCompleted: () => void;
  onInstallStarted: () => void;
  onInstallCompleted: () => void;
}

export abstract class IExternalUnit {
  protected _lastValidationResult: ExternalValidationResult | null = null;
  protected canceler: (() => void) | null = null;

  get lastValidationResult(): ExternalValidationResult | null {
    return this._lastValidationResult;
  }

  async validate(): Promise<ExternalValidationResult> {
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
    return this._lastValidationResult;
  }

  isValid(): ExternalValidationResult {
    return this._lastValidationResult ?? { valid: false, error: null };
  }

  isInstallNeeded(): boolean {
    return !this.isValid().valid;
  }

  abstract getKey(): ExternalKey;
  abstract getName(): string;
  abstract isPlatformSupported(): boolean;
  abstract getEnvKeys(): string[];
  abstract validateInternal(): PromiseOrValue<void>;
  abstract isAgreementNeeded(): PromiseOrValue<boolean>;
  abstract writeAgreement(value: boolean): PromiseOrValue<void>;
  abstract isManualInstallNeeded(): boolean;
  abstract install(): PromiseOrValue<void>;
  abstract cancelInstall(): PromiseOrValue<void>;
  abstract uninstall(): PromiseOrValue<void>;
  abstract getTermUrl(): PromiseOrValue<string | null>;
}
