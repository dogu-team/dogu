import { NodeAttributes, PageSourceParserFacade } from '@dogu-private/console';
import 'reflect-metadata';

import { InspectorWorkerMessage, InspectorWorkerResponse } from '../types/inspector';

globalThis.onmessage = (e: MessageEvent<InspectorWorkerMessage>) => {
  const { type, result, platform } = e.data;

  if (type === 'convert') {
    const convertedResult: InspectorWorkerResponse<NodeAttributes>[] = [];

    for (const r of result) {
      const { context, pageSource } = r;
      convertedResult.push({ context, node: new PageSourceParserFacade().parse(platform, pageSource) });
    }

    self.postMessage(convertedResult);
  }
};

export {};
