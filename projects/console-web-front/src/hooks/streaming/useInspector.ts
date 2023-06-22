import { DeviceBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import { ContextPageSource, ScreenSize } from '@dogu-tech/device-client-common';
import { throttle } from 'lodash';
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InspectorModule, NodeBound } from '../../modules/inspector';
import AndroidInspectorModule from '../../modules/inspector/android';

import { BrowserDeviceInspector } from '../../utils/browser-device-inspector';
import { DeviceRotationDirection, InspectNode, InspectorWorkerResponse } from '../../workers/native-ui-tree';

export type InspectorWorkerMessage = {
  type: 'convert';
  result: ContextPageSource[];
  platform: Platform;
};

export interface ContextAndNode {
  context: Pick<ContextPageSource, 'context'>['context'];
  android: Pick<ContextPageSource, 'android'>['android'];
  screenSize: Pick<ContextPageSource, 'screenSize'>['screenSize'];
  node: InspectNode;
}

export type SelectedNodePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type InspectNodeWithPosition = {
  node: InspectNode;
  position: SelectedNodePosition;
};

export const GAMIUM_CONTEXT_KEY = 'GAMIUM';

const useInspector = (deviceInspector: BrowserDeviceInspector | undefined, device: DeviceBase | null, videoRef: RefObject<HTMLVideoElement> | null) => {
  const [contextAndNodes, setContextAndNodes] = useState<ContextAndNode[]>();
  const [selectedContextKey, setSelectedContextKey] = useState<string>();
  const [hitPoint, setHitPoint] = useState();
  const [selectedNode, setSelectedNode] = useState<InspectNodeWithPosition>();
  const [inspectingNode, setInspectingNode] = useState<InspectNodeWithPosition>();
  const inspectorModule = useRef<InspectorModule>();

  const worker = useMemo(() => new Worker(new URL('../../workers/native-ui-tree.ts', import.meta.url)), []);
  const selectedContextAndNode = contextAndNodes?.find((c) => c.context === selectedContextKey);
  const isGamium = selectedContextKey === GAMIUM_CONTEXT_KEY;

  useEffect(() => {
    if (selectedContextAndNode) {
      if (isGamium) {
      } else {
        if (device?.platform) {
          switch (device.platform) {
            case Platform.PLATFORM_ANDROID:
              inspectorModule.current = new AndroidInspectorModule(selectedContextAndNode);
          }
        }
      }
    }
  }, [selectedContextAndNode, isGamium, device?.platform]);

  const getRawSources = useCallback(async () => {
    if (deviceInspector && device) {
      const result = await deviceInspector.getContextPageSources(device.serial);
      return result;
    }

    throw new Error('deviceInspector or device is undefined');
  }, [deviceInspector, device]);

  const updateSources = useCallback(async () => {
    if (!device) {
      return;
    }

    try {
      const rawResult = await getRawSources();
      const message: InspectorWorkerMessage = {
        result: rawResult,
        type: 'convert',
        platform: device.platform,
      };
      worker.postMessage(message);
      const results = (await new Promise((resolve) => {
        worker.onmessage = (e: MessageEvent<InspectorWorkerResponse[]>) => {
          resolve(e.data);
        };
      }).catch((e) => {
        console.debug('error while update sources', e);
      })) as { context: string; node: InspectNode }[];

      const mappedResults: ContextAndNode[] = results.map((result) => {
        const r = rawResult.find((r) => r.context === result.context)!;

        return {
          ...result,
          android: r?.android,
          screenSize: r.screenSize,
        };
      });
      setContextAndNodes(mappedResults);
    } catch (e) {
      console.debug('error while update sources', e);
    }
  }, [getRawSources, worker, device]);

  const getScreenPosition = useCallback(
    ({
      rotation,
      screenSize,
      inspectArea,
      nodePos,
    }: {
      rotation: DeviceRotationDirection;
      screenSize: ScreenSize;
      inspectArea: NodeBound;
      nodePos: NodeBound;
    }): SelectedNodePosition | undefined => {
      console.log(nodePos);
      if (!videoRef?.current) {
        return;
      }

      const deviceWidthRatio = videoRef.current.offsetWidth / screenSize.width;
      const deviceHeightRatio = videoRef.current.offsetHeight / screenSize.height;

      const x = nodePos.x * deviceWidthRatio;
      const y = nodePos.y * deviceHeightRatio;
      const width = Math.abs(nodePos.width) * deviceWidthRatio;
      const height = Math.abs(nodePos.height) * deviceHeightRatio;

      return { x, y, width, height };
    },
    [videoRef],
  );

  const getNodeByKey = useCallback(
    (key: string): InspectNodeWithPosition | undefined => {
      if (!selectedContextAndNode || !inspectorModule.current) {
        return;
      }

      const { node } = selectedContextAndNode;

      const findNode = (node: InspectNode): InspectNode | undefined => {
        if (node.key === key) {
          return node;
        }

        if (node.children) {
          for (const child of node.children) {
            const result = findNode(child);
            if (result) {
              return result;
            }
          }
        }
      };

      const result = findNode(node);

      if (!result) {
        return;
      }

      const position = getScreenPosition({
        screenSize: inspectorModule.current.getDeviceScreenSize(),
        nodePos: inspectorModule.current.getNodeBound(result),
        rotation: inspectorModule.current.getDeviceRotation(),
        inspectArea: inspectorModule.current.getInspectingArea(),
      });

      if (!position) {
        return;
      }

      return { node: result, position };
    },
    [getScreenPosition, selectedContextAndNode],
  );

  const getNodeByPos = useCallback(
    (e: React.MouseEvent): InspectNodeWithPosition | undefined => {
      if (!selectedContextAndNode || !videoRef?.current || !device || !inspectorModule.current) {
        return;
      }

      const { node } = selectedContextAndNode;

      const deviceSize = inspectorModule.current.getDeviceScreenSize();

      const mouseX = e.nativeEvent.offsetX;
      const mouseY = e.nativeEvent.offsetY;

      const videoWidth = videoRef.current.offsetWidth;
      const videoHeight = videoRef.current.offsetHeight;

      const deviceWidthRatio = videoWidth / deviceSize.width;
      const deviceHeightRatio = videoHeight / deviceSize.height;

      const inspectArea = inspectorModule.current.getInspectingArea();

      const inspectAreaX = inspectArea.x * deviceWidthRatio;
      const inspectAreaY = inspectArea.y * deviceHeightRatio;
      const inspectAreaWidth = inspectArea.width * deviceWidthRatio;
      const inspectAreaHeight = inspectArea.height * deviceHeightRatio;

      if (mouseX < inspectAreaX || mouseX > inspectAreaX + inspectAreaWidth || mouseY < inspectAreaY || mouseY > inspectAreaY + inspectAreaHeight) {
        console.log('wrong');
        return;
      }

      const findNodesIncludePoint = (node: InspectNode): InspectNode[] => {
        const result: InspectNode[] = [];

        if (node.attributes.bounds) {
          const { bounds } = node.attributes;

          if (!bounds) {
            return [];
          }

          // bounds is { start: [x, y], end: [x, y] }
          const { start, end } = bounds;

          const deviceX = mouseX / deviceWidthRatio;
          const deviceY = mouseY / deviceHeightRatio;

          if (!start || !end) {
            return [];
          }

          if (start[0] <= deviceX && deviceX <= end[0] && start[1] <= deviceY && deviceY <= end[1]) {
            result.push(node);
          }
        }

        if (node.children) {
          for (const child of node.children) {
            const childResult = findNodesIncludePoint(child);
            result.push(...childResult);
          }
        }

        return result;
      };

      const nodes = findNodesIncludePoint(node);

      if (!nodes.length) {
        return;
      }

      const lastNode = nodes[nodes.length - 1];
      const position = getScreenPosition({
        screenSize: inspectorModule.current.getDeviceScreenSize(),
        nodePos: inspectorModule.current.getNodeBound(lastNode),
        rotation: inspectorModule.current.getDeviceRotation(),
        inspectArea: inspectorModule.current.getInspectingArea(),
      });

      if (!position) {
        return;
      }

      return { node: lastNode, position };
    },
    [getScreenPosition, selectedContextAndNode, videoRef, device],
  );

  const updateInspectingNodeByKey = useCallback(
    (key: string) => {
      const nodeAndPosition = getNodeByKey(key);
      if (nodeAndPosition) {
        setInspectingNode(nodeAndPosition);
      }
    },
    [getNodeByKey],
  );

  const updateInspectingNodeByPos = useMemo(() => {
    return throttle((e: React.MouseEvent) => {
      const nodeAndPosition = getNodeByPos(e);
      if (nodeAndPosition) {
        setInspectingNode(nodeAndPosition);
      }
    }, 50);
  }, [getNodeByPos]);

  const getHitPoint = useCallback(async () => {}, []);

  const updateSelectedContextKey = useCallback((key: string | undefined) => {
    setSelectedContextKey(key);
    setInspectingNode(undefined);
    setSelectedNode(undefined);
  }, []);

  const clearInspectingNode = useCallback(() => {
    setInspectingNode(undefined);
  }, []);

  const updateSelectedNode = useCallback(
    (key: string) => {
      const nodeAndPosition = getNodeByKey(key);

      if (nodeAndPosition) {
        setSelectedNode(nodeAndPosition);
      }
    },
    [getNodeByKey],
  );

  const updateSelectedNodeFromInspectingNode = useCallback(() => {
    setSelectedNode(inspectingNode);
  }, [inspectingNode]);

  const clearSelectedNode = useCallback(() => {
    setSelectedNode(undefined);
  }, []);

  const connectGamium = useCallback(async () => {
    if (!deviceInspector || !device) {
      return;
    }

    try {
      const result = await deviceInspector?.tryConnectGamiumInspector(device.serial);
      return result;
    } catch (e) {
      console.error(e);
    }
  }, [deviceInspector, device]);

  return {
    contextAndNodes,
    selectedContextKey,
    inspectingNode,
    selectedNode,
    updateSources,
    updateInspectingNodeByKey,
    updateInspectingNodeByPos,
    getHitPoint,
    updateSelectedContextKey,
    clearInspectingNode,
    updateSelectedNode,
    updateSelectedNodeFromInspectingNode,
    clearSelectedNode,
    connectGamium,
  };
};

export default useInspector;
