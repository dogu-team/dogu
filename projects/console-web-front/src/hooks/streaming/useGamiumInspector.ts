import { DeviceBase } from '@dogu-private/console';
import { HitPoint } from '@dogu-tech/device-client-common';
import { DataNode } from 'antd/es/tree';
import { GamiumClient, ObjectInfo, Vector2 } from 'gamium/common';
import { throttle } from 'lodash';
import React, { RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import useEventStore from '../../stores/events';

import { ResizedObjectInfo, StreamingHotKey } from '../../types/streaming';
import { BrowserDeviceInspector } from '../../utils/streaming/browser-device-inspector';

type YDirection = 'bottomUp' | 'topDown';

const useGamiumInspector = (
  deviceInspector: RefObject<BrowserDeviceInspector | undefined>,
  gamiumRef: RefObject<GamiumClient | undefined>,
  device: DeviceBase | null,
  videoRef: RefObject<HTMLVideoElement> | null,
) => {
  const [gamiumTreeNode, setGamiumTreeNode] = useState<DataNode[]>();
  const [hitPoint, setHitPoint] = useState<HitPoint>();
  const [gamiumSelectedNode, setSelectedGamiumNode] = useState<ResizedObjectInfo>();
  const [gamiumInspectingNode, setInspectingGamiumNode] = useState<ResizedObjectInfo>();

  const worker = useMemo(() => new Worker(new URL('../../workers/gamium-ui-tree.ts', import.meta.url)), []);

  // const resetResizedObjectInfos = useCallback(() => {
  //   setTimeout(() => setResizedObjectInfos(undefined), THROTTLE_INTERVAL);
  // }, []);

  useEffect(() => {
    useEventStore.subscribe(({ eventName, payload }) => {
      if (eventName === 'onStreamingHotkeyPressed') {
        if (payload === StreamingHotKey.INSPECTOR_SELECT) {
          setInspectingGamiumNode(undefined);
        }
      }
    });
  }, []);

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

  const handleDumpHierarchy = useCallback(async () => {
    if (!gamiumRef.current) {
      return;
    }

    try {
      const connectResult = await connectGamium();
      if (connectResult === 'connected') {
        const result = await gamiumRef.current.inspector().dumpHierarchy('', 0);
        worker.postMessage(result);
        const convertedResult: DataNode[] = await new Promise((resolve) => {
          worker.onmessage = (e: MessageEvent<DataNode[]>) => {
            resolve(e.data);
          };
        });
        setGamiumTreeNode(convertedResult);
      } else {
        setGamiumTreeNode(undefined);
      }
    } catch (e) {
      setGamiumTreeNode(undefined);
      console.error('Failed to dump hierarchy', e);
    }
  }, [connectGamium]);

  const getObjectArea = useCallback((deviceSize: Vector2, infos: ObjectInfo[], yDir: YDirection) => {
    if (!videoRef?.current) {
      return [];
    }

    const videoOrigin = { width: videoRef.current.offsetWidth, height: videoRef.current.offsetHeight };
    const widthRatio = videoOrigin.width / deviceSize.x;
    const heightRatio = videoOrigin.height / deviceSize.y;

    const resizedInfos: ResizedObjectInfo[] = infos.map((item) => {
      const resizedWidth = item.screenRectSize!.x * widthRatio;
      const resizedHeight = item.screenRectSize!.y * heightRatio;
      const offsetX = item.screenPosition!.x * widthRatio - resizedWidth / 2;

      let offsetY: number;
      if (yDir === 'bottomUp') {
        offsetY = videoOrigin.height - (item.screenPosition!.y * heightRatio + resizedHeight / 2);
      } else {
        offsetY = item.screenPosition!.y * heightRatio - resizedHeight / 2;
      }

      return { width: resizedWidth, height: resizedHeight, x: offsetX, y: offsetY, origin: item };
    });

    return resizedInfos;
  }, []);

  const handleInspectOnScreen = useCallback(
    async (event: React.MouseEvent) => {
      if (!gamiumRef.current || event.currentTarget === null) {
        return;
      }

      try {
        const result = await gamiumRef.current
          .inspector()
          .inspectOnPos(
            { x: event.nativeEvent.offsetX, y: event.currentTarget.clientHeight - event.nativeEvent.offsetY },
            { x: event.currentTarget.clientWidth, y: event.currentTarget.clientHeight },
          )
          .catch((e) => {
            console.warn(e);
            return undefined;
          });
        const screenSize = await gamiumRef.current.screen();

        if (result?.infos) {
          const resizedInfos = getObjectArea(
            { x: screenSize.width, y: screenSize.height },
            [result.infos?.[0]],
            'bottomUp',
          );
          setInspectingGamiumNode(resizedInfos?.[0]);
        }
        setHitPoint(result?.hitPoint ?? undefined);
      } catch (e) {
        console.warn(e);
      }
    },
    [getObjectArea],
  );

  const throttleInpsectOnScreen = useMemo(() => {
    return throttle((e: React.MouseEvent) => handleInspectOnScreen(e), 50);
  }, [handleInspectOnScreen]);

  const handleInspectWithId = useCallback(
    async (objectId: string) => {
      if (!gamiumRef.current) {
        return;
      }

      try {
        const result = await gamiumRef.current
          .inspector()
          .inspect(objectId)
          .catch((e) => {
            return undefined;
          });
        const screenSize = await gamiumRef.current.screen();

        if (result) {
          const resizedInfos = getObjectArea({ x: screenSize.width, y: screenSize.height }, [result], 'bottomUp');
          return resizedInfos?.[0];
          // setInspectingGamiumNode(resizedInfos?.[0]);
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [getObjectArea],
  );

  const clearInspectingNode = useCallback(() => {
    setInspectingGamiumNode(undefined);
  }, []);

  const updateSelectedNodeFromInspectingNode = useCallback(() => {
    setSelectedGamiumNode(gamiumInspectingNode);
    clearInspectingNode();
  }, [gamiumInspectingNode, clearInspectingNode]);

  const updateSelectedNodeByXPath = useCallback(
    async (xpath: string) => {
      const result = await handleInspectWithId(xpath);
      if (result) {
        setSelectedGamiumNode(result);
      }
    },
    [handleInspectWithId],
  );

  const updateInspectingNodeByXPath = useCallback(
    async (xpath: string) => {
      const result = await handleInspectWithId(xpath);
      if (result) {
        setInspectingGamiumNode(result);
      }
    },
    [handleInspectWithId],
  );

  return {
    gamiumTreeNode,
    hitPoint,
    handleDumpHierarchy,
    throttleInpsectOnScreen,
    gamiumInspectingNode,
    gamiumSelectedNode,
    updateSelectedNodeFromInspectingNode,
    clearInspectingNode,
    updateSelectedNodeByXPath,
    updateInspectingNodeByXPath,
  };
};

export default useGamiumInspector;
