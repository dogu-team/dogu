import { DeviceBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import { ContextPageSource, Rect, ScreenSize } from '@dogu-tech/device-client-common';
import { throttle } from 'lodash';
import { node } from 'prop-types';
import { T } from 'ramda';
import React, { RefObject, useCallback, useMemo, useState } from 'react';

import { BrowserDeviceInspector } from '../../utils/browser-device-inspector';
import { DeviceRotationDirection, GamiumAttributes, InspectNode, InspectNodeAttributes, InspectorWorkerResponse } from '../../workers/native-ui-tree';

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

  const worker = useMemo(() => new Worker(new URL('../../workers/native-ui-tree.ts', import.meta.url)), []);
  const isGamium = selectedContextKey === GAMIUM_CONTEXT_KEY;

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

  const getSelectedContextAndNode = useCallback(() => {
    if (!contextAndNodes || !selectedContextKey) {
      return;
    }

    const item = contextAndNodes.find((item) => item.context === selectedContextKey);
    return item;
  }, [contextAndNodes, selectedContextKey]);

  const getRotationDirection = useCallback(
    (platform: Platform): DeviceRotationDirection => {
      const selectedNodes = getSelectedContextAndNode();

      if (!selectedNodes) {
        return DeviceRotationDirection.TOP_DOWN;
      }

      switch (platform) {
        case Platform.PLATFORM_ANDROID:
          const rotation = Number(selectedNodes.node.attributes?.rotation) || 0;
          return rotation;
        default:
          return DeviceRotationDirection.TOP_DOWN;
      }
    },
    [getSelectedContextAndNode],
  );

  const getScreenPosition = useCallback(
    (
      deviceInfo: { deviceWidth: number; deviceHeight: number },
      bounds: InspectNodeAttributes['bounds'],
      options: { landscapce: boolean; screenSize?: ScreenSize; androidViewport?: Rect },
    ): SelectedNodePosition | undefined => {
      if (!bounds || !videoRef?.current) {
        return;
      }

      let deviceWidth = options?.screenSize?.width || deviceInfo.deviceWidth;
      let deviceHeight = options?.screenSize?.height || deviceInfo.deviceHeight;
      let inspectAreaWidth = options?.androidViewport?.width || deviceInfo.deviceWidth;
      let inspectAreaHeight = options?.androidViewport?.height || deviceInfo.deviceHeight;

      if (options.landscapce) {
        [deviceWidth, deviceHeight] = [deviceHeight, deviceWidth];
        [inspectAreaWidth, inspectAreaHeight] = [inspectAreaHeight, inspectAreaWidth];
        inspectAreaWidth += options.androidViewport?.y || 0;
        inspectAreaHeight -= options.androidViewport?.y || 0;
      }

      const deviceWidthRatio = videoRef.current.offsetWidth / deviceWidth;
      const deviceHeightRatio = videoRef.current.offsetHeight / deviceHeight;

      // DO NOT ADD INSPECT AREA in x,y
      // bounds is screen offset.
      let screenX = bounds.start[0];
      let screenY = bounds.start[1];
      let screenWidth = Math.abs(bounds.end[0] - bounds.start[0]);
      let screenHeight = Math.abs(bounds.end[1] - bounds.start[1]);

      const x = screenX * deviceWidthRatio;
      const y = screenY * deviceHeightRatio;
      const width = Math.abs(screenWidth) * deviceWidthRatio;
      const height = Math.abs(screenHeight) * deviceHeightRatio;

      return { x, y, width, height };
    },
    [videoRef],
  );

  const getNodeByKey = useCallback(
    (key: string): InspectNodeWithPosition | undefined => {
      const item = getSelectedContextAndNode();

      if (!item) {
        return;
      }

      const { node } = item;

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

      const deviceHeight = node.attributes.height;
      const deviceWidth = node.attributes.width;

      if (!deviceHeight || !deviceWidth) {
        return;
      }

      if (isGamium) {
        const attrs = result.attributes as GamiumAttributes;

        if (!attrs['screen-position'] || !attrs['screen-rect-size']) {
          return;
        }

        const start: [number, number] = [attrs['screen-position'].x - attrs['screen-rect-size'].width / 2, attrs['screen-position'].y - attrs['screen-rect-size'].height / 2];
        const end: [number, number] = [attrs['screen-position'].x + attrs['screen-rect-size'].width / 2, attrs['screen-position'].y + attrs['screen-rect-size'].height / 2];

        const position = getScreenPosition(
          { deviceHeight: Number(deviceHeight), deviceWidth: Number(deviceWidth) },
          { start, end },
          {
            landscapce: true,
          },
        );

        if (!position) {
          return;
        }

        return { node: result, position };
      }

      const position = getScreenPosition({ deviceHeight, deviceWidth }, result.attributes.bounds, {
        landscapce: Number(node.attributes.rotation) % 2 === 1,
        screenSize: item.screenSize,
        androidViewport: item.android?.viewport,
      });

      if (!position) {
        return;
      }

      return { node: result, position };
    },
    [getScreenPosition, getSelectedContextAndNode, isGamium],
  );

  const getNodeByPos = useCallback(
    (e: React.MouseEvent): InspectNodeWithPosition | undefined => {
      const item = getSelectedContextAndNode();

      if (!item || !videoRef?.current || !device) {
        return;
      }

      const { node, screenSize, android } = item;

      let deviceWidth = screenSize?.width || node.attributes.width;
      let deviceHeight = screenSize?.height || node.attributes.height;

      if (!deviceHeight || !deviceWidth) {
        return;
      }

      const rotationDirection = getRotationDirection(device.platform);
      const isLandscape = rotationDirection % 2 === 1;

      const mouseX = e.nativeEvent.offsetX;
      const mouseY = e.nativeEvent.offsetY;

      const videoWidth = videoRef.current.offsetWidth;
      const videoHeight = videoRef.current.offsetHeight;

      const deviceWidthRatio = videoWidth / deviceWidth;
      const deviceHeightRatio = videoHeight / deviceHeight;

      const inspectAreaOffsetX = android?.viewport?.x || 0;
      const inspectAreaOffsetY = android?.viewport?.y || 0;
      const inspectAreaRealWidth = android?.viewport?.width || deviceWidth;
      const inspectAreaRealHeight = android?.viewport?.height || deviceHeight;

      const inspectAreaX = inspectAreaOffsetX * deviceWidthRatio;
      const inspectAreaY = inspectAreaOffsetY * deviceHeightRatio;
      const inspectAreaWidth = inspectAreaRealWidth * deviceWidthRatio;
      const inspectAreaHeight = inspectAreaRealHeight * deviceHeightRatio;

      if (mouseX < inspectAreaX || mouseX > inspectAreaX + inspectAreaWidth || mouseY < inspectAreaY || mouseY > inspectAreaY + inspectAreaHeight) {
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
      const position = getScreenPosition({ deviceHeight, deviceWidth }, lastNode.attributes.bounds, {
        landscapce: isLandscape,
        screenSize: item.screenSize,
        androidViewport: item.android?.viewport,
      });

      if (!position) {
        return;
      }

      return { node: lastNode, position };
    },
    [getScreenPosition, getSelectedContextAndNode, videoRef, device, getRotationDirection],
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
