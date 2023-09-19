import { DownloadProgress } from '@dogu-tech/node';
import { ExternalKey } from '../../shares/external';

export interface ExternalUnitCallback {
  onDownloadStarted: () => void;
  onDownloadInProgress: (progress: DownloadProgress) => void;
  onDownloadCompleted: () => void;
  onInstallStarted: () => void;
  onInstallCompleted: () => void;
}

export type UnitCallbackFactory = (key: ExternalKey) => ExternalUnitCallback;
