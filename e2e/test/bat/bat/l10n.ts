import { createL10nFunction, createL10nMap, L10n } from '../../../src/l10n';

export interface E2eL10nValue {
  NEW_HOST_TOKEN: string;
  CONNECTED: string;
  HOST: string;
  START_USING: string;
  EDIT_TAGS: string;
  PIPELINES: string;
  RUN_E2E_ROUTINE: string;
  SUCCESS: string;
  PENDING: string;
  STREAMING: string;
  INFORMATION: string;
}

export const l10nMap = createL10nMap<E2eL10nValue>([
  {
    l10n: 'en',
    value: {
      NEW_HOST_TOKEN: 'New Host Token: ',
      CONNECTED: 'Connected',
      HOST: 'Host',
      START_USING: 'Start using',
      EDIT_TAGS: 'Edit tags',
      PIPELINES: 'Pipelines',
      RUN_E2E_ROUTINE: 'Run e2e',
      SUCCESS: 'Success',
      PENDING: 'Pending',
      STREAMING: 'Streaming',
      INFORMATION: 'About device',
    },
  },
  {
    l10n: 'ko',
    value: {
      NEW_HOST_TOKEN: '새 호스트 토큰: ',
      CONNECTED: 'Connected',
      HOST: 'Host',
      START_USING: '사용하기',
      EDIT_TAGS: '태그 변경',
      PIPELINES: 'Pipelines',
      RUN_E2E_ROUTINE: 'e2e 실행',
      SUCCESS: 'Success',
      PENDING: 'Pending',
      STREAMING: '스트리밍',
      INFORMATION: '디바이스 정보',
    },
  },
]);

export const currentL10n: L10n = 'ko';
export const l10n = createL10nFunction(l10nMap, currentL10n);
