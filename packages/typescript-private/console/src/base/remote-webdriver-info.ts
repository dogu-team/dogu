import { RemoteId, RemoteWebDriverInfoId, WebDriverSessionId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RemoteBase } from './remote';

interface RemoteWebDriverInfoRelationTraits {
  remote?: RemoteBase;
}

interface RemoteWebDriverInfoBaseTraits {
  remoteWebDriverInfoId: RemoteWebDriverInfoId;
  remoteId: RemoteId;
  sessionId: WebDriverSessionId;
  browserName: string | null;
  browserVersion: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RemoteWebDriverInfoBase = RemoteWebDriverInfoBaseTraits & RemoteWebDriverInfoRelationTraits;
export const RemoteWebDriverInfoPropCamel = propertiesOf<RemoteWebDriverInfoBase>();
export const RemoteWebDriverInfoPropSnake = camelToSnakeCasePropertiesOf<RemoteWebDriverInfoBase>();
