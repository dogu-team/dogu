import { DeviceBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import { ScreenSize } from '@dogu-tech/device-client-common';
import { throttle } from 'lodash';
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeviceRotationDirection, InspectorModule } from '../../modules/inspector';
import AndroidInspectorModule from '../../modules/inspector/android';
import {
  AndroidNodeAttributes,
  ContextAndNode,
  InspectNode,
  InspectNodeAttributes,
  InspectNodeWithPosition,
  InspectorWorkerMessage,
  InspectorWorkerResponse,
  NodePosition,
  SelectedNodePosition,
} from '../../types/inspector';

import { BrowserDeviceInspector } from '../../utils/browser-device-inspector';

export const GAMIUM_CONTEXT_KEY = 'GAMIUM';

const useInspector = (deviceInspector: BrowserDeviceInspector | undefined, device: DeviceBase | null, videoRef: RefObject<HTMLVideoElement> | null) => {
  const [contextAndNodes, setContextAndNodes] = useState<ContextAndNode<InspectNodeAttributes>[]>();
  const [selectedContextKey, setSelectedContextKey] = useState<string>();
  const [hitPoint, setHitPoint] = useState();
  const [selectedNode, setSelectedNode] = useState<InspectNodeWithPosition<InspectNodeAttributes>>();
  const [inspectingNode, setInspectingNode] = useState<InspectNodeWithPosition<InspectNodeAttributes>>();
  const inspectorModule = useRef<InspectorModule<any>>();

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
              inspectorModule.current = new AndroidInspectorModule(selectedContextAndNode as ContextAndNode<AndroidNodeAttributes>);
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
        worker.onmessage = (e: MessageEvent<InspectorWorkerResponse<InspectNodeAttributes>[]>) => {
          resolve(e.data);
        };
      }).catch((e) => {
        console.debug('error while update sources', e);
      })) as { context: string; node: InspectNode<InspectNodeAttributes> }[];

      const mappedResults: ContextAndNode<InspectNodeAttributes>[] = results.map((result) => {
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
      inspectArea: NodePosition;
      nodePos: NodePosition;
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
    (key: string): InspectNodeWithPosition<InspectNodeAttributes> | undefined => {
      if (!selectedContextAndNode || !inspectorModule.current) {
        return;
      }

      const { node } = selectedContextAndNode;

      const findNode = (node: InspectNode<InspectNodeAttributes>): InspectNode<InspectNodeAttributes> | undefined => {
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
    (e: React.MouseEvent): InspectNodeWithPosition<InspectNodeAttributes> | undefined => {
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
        return;
      }

      const findNodesIncludePoint = (node: InspectNode<InspectNodeAttributes>): InspectNode<InspectNodeAttributes>[] => {
        const result: InspectNode<InspectNodeAttributes>[] = [];
        const nodePos = inspectorModule.current?.getNodeBound(node);

        if (nodePos) {
          const deviceX = mouseX / deviceWidthRatio;
          const deviceY = mouseY / deviceHeightRatio;

          if (nodePos.x <= deviceX && deviceX <= nodePos.x + nodePos.width && nodePos.y <= deviceY && deviceY <= nodePos.y + nodePos.height) {
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

      let smallestNodeIndex = 0;
      let smallestValue: number;
      nodes.forEach((node, i) => {
        const pos = inspectorModule.current?.getNodeBound(node);
        if (!pos) {
          return;
        }

        const value = pos.width * pos.height;
        if (i === 0) {
          smallestValue = value;
        }

        if (value < smallestValue) {
          smallestValue = value;
          smallestNodeIndex = i;
        }
      });

      const smallestNode = nodes[smallestNodeIndex];

      const position = getScreenPosition({
        screenSize: inspectorModule.current.getDeviceScreenSize(),
        nodePos: inspectorModule.current.getNodeBound(smallestNode),
        rotation: inspectorModule.current.getDeviceRotation(),
        inspectArea: inspectorModule.current.getInspectingArea(),
      });

      if (!position) {
        return;
      }

      return { node: smallestNode, position };
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
