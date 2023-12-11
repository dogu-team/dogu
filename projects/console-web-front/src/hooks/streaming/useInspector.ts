import {
  ContextNode,
  DeviceBase,
  DeviceRotationDirection,
  GAMIUM_CONTEXT_KEY,
  NodeAttributes,
  NodePosition,
  NodeUtilizer,
  NodeUtilizerFactory,
  NodeWithPosition,
  ParsedNode,
} from '@dogu-private/console';
import { ScreenSize } from '@dogu-tech/device-client-common';
import { GamiumClient } from 'gamium/common';
import { throttle } from 'lodash';
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { InspectorWorkerMessage, InspectorWorkerResponse } from '../../types/inspector';
import { BrowserDeviceInspector } from '../../utils/streaming/browser-device-inspector';

const useInspector = (
  deviceInspector: RefObject<BrowserDeviceInspector | undefined>,
  gamiumRef: RefObject<GamiumClient | undefined>,
  device: DeviceBase | null,
  videoRef: RefObject<HTMLVideoElement> | null,
) => {
  const [contextAndNodes, setContextAndNodes] = useState<ContextNode<NodeAttributes>[]>();
  const [selectedContextKey, setSelectedContextKey] = useState<string>();
  // const [hitPoint, setHitPoint] = useState<HitPoint>();
  const [selectedNode, setSelectedNode] = useState<NodeWithPosition<NodeAttributes>>();
  const [inspectingNode, setInspectingNode] = useState<NodeWithPosition<NodeAttributes>>();
  const inspectorModule = useRef<NodeUtilizer<NodeAttributes>>();

  const worker = useMemo(() => new Worker(new URL('../../workers/native-ui-tree.ts', import.meta.url)), []);
  const selectedContextAndNode: ContextNode<NodeAttributes> | undefined = contextAndNodes?.find(
    (c) => c.context === selectedContextKey,
  );
  const isGamium = selectedContextKey === GAMIUM_CONTEXT_KEY;

  useEffect(() => {
    if (selectedContextAndNode && device?.platform) {
      inspectorModule.current = NodeUtilizerFactory.create(
        device?.platform,
        selectedContextAndNode,
      ) as NodeUtilizer<NodeAttributes>;
    }
  }, [selectedContextAndNode, isGamium, device?.platform]);

  const connectGamium = useCallback(async () => {
    if (!deviceInspector.current || !device) {
      return;
    }

    try {
      const result = await deviceInspector.current.tryConnectGamiumInspector(device.serial);
      return result;
    } catch (e) {
      console.error(e);
    }
  }, [device]);

  const getRawSources = useCallback(async () => {
    if (deviceInspector.current && device) {
      const result = await deviceInspector.current.getContextPageSources(device.serial);
      const resultWithoutGmaium = result.filter((r) => r.context !== GAMIUM_CONTEXT_KEY);
      return resultWithoutGmaium;
    }

    throw new Error('deviceInspector or device is undefined');
  }, [device]);

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
        worker.onmessage = (e: MessageEvent<InspectorWorkerResponse<NodeAttributes>[]>) => {
          resolve(e.data);
        };
      }).catch((e) => {
        console.debug('error while update sources', e);
      })) as { context: string; node: ParsedNode<NodeAttributes> }[];

      const mappedResults: ContextNode<NodeAttributes>[] = results.map((result) => {
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
    }): NodePosition | undefined => {
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
    (key: string): NodeWithPosition<NodeAttributes> | undefined => {
      if (!selectedContextAndNode || !inspectorModule.current) {
        return;
      }

      const { node } = selectedContextAndNode;

      const findNode = (node: ParsedNode<NodeAttributes>): ParsedNode<NodeAttributes> | undefined => {
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
    async (e: React.MouseEvent): Promise<NodeWithPosition<NodeAttributes> | undefined> => {
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

      if (
        mouseX < inspectAreaX ||
        mouseX > inspectAreaX + inspectAreaWidth ||
        mouseY < inspectAreaY ||
        mouseY > inspectAreaY + inspectAreaHeight
      ) {
        return;
      }

      const findNodesIncludePoint = (node: ParsedNode<NodeAttributes>): ParsedNode<NodeAttributes>[] => {
        const result: ParsedNode<NodeAttributes>[] = [];
        const nodePos = inspectorModule.current?.getNodeBound(node);

        if (nodePos) {
          const deviceX = mouseX / deviceWidthRatio;
          const deviceY = mouseY / deviceHeightRatio;

          if (
            nodePos.x <= deviceX &&
            deviceX <= nodePos.x + nodePos.width &&
            nodePos.y <= deviceY &&
            deviceY <= nodePos.y + nodePos.height
          ) {
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
          return;
        }

        // if node is too small, ignore it
        if (value <= 4) {
          return;
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
    [getScreenPosition, selectedContextAndNode, videoRef, device, selectedContextKey],
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
    return throttle(async (e: React.MouseEvent) => {
      const nodeAndPosition = await getNodeByPos(e);
      if (nodeAndPosition) {
        setInspectingNode(nodeAndPosition);
      }
    }, 50);
  }, [getNodeByPos]);

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
    clearInspectingNode();
  }, [inspectingNode, clearInspectingNode]);

  const clearSelectedNode = useCallback(() => {
    setSelectedNode(undefined);
  }, []);

  // const updateHitPoint = useCallback(
  //   async (e: React.MouseEvent) => {
  //     if (isGamium && device?.serial && deviceInspector.current && videoRef?.current) {
  //       const mouseX = e.nativeEvent.offsetX;
  //       const mouseY = e.nativeEvent.offsetY;

  //       const deviceSize = inspectorModule.current?.getDeviceScreenSize();

  //       if (!deviceSize) {
  //         return;
  //       }

  //       const videoWidth = videoRef.current.offsetWidth;
  //       const videoHeight = videoRef.current.offsetHeight;
  //       const deviceWidthRatio = videoWidth / deviceSize.width;
  //       const deviceHeightRatio = videoHeight / deviceSize.height;
  //       const deviceX = mouseX / deviceWidthRatio;
  //       const deviceY = mouseY / deviceHeightRatio;

  //       try {
  //         const hitpoint = await deviceInspector.current.getHitPoint(
  //           device.serial,
  //           {
  //             x: deviceX,
  //             y: deviceY,
  //           },
  //           deviceSize,
  //         );
  //         setHitPoint(hitpoint);
  //       } catch (e) {
  //         console.debug('error get hitpoint', e);
  //       }
  //     }
  //   },
  //   [isGamium, device?.serial, videoRef],
  // );

  return {
    contextAndNodes,
    selectedContextKey,
    inspectingNode,
    selectedNode,
    // hitPoint,
    updateSources,
    updateInspectingNodeByKey,
    updateInspectingNodeByPos,
    updateSelectedContextKey,
    clearInspectingNode,
    updateSelectedNode,
    updateSelectedNodeFromInspectingNode,
    clearSelectedNode,
    connectGamium,
    // updateHitPoint,
  };
};

export default useInspector;
