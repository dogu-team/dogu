import { ContextNode } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import { ContextPageSource } from '@dogu-tech/device-client-common';

export type InspectorWorkerMessage = {
  type: 'convert';
  result: ContextPageSource[];
  platform: Platform;
};

export type InspectorWorkerResponse<A> = Pick<ContextNode<A>, 'context' | 'node'>;
