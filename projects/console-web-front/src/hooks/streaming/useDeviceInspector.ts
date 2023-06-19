import { GamiumClient, ObjectInfo, Vector2, Vector3 } from 'gamium/common';
import { throttle } from 'lodash';
import { RefObject, useCallback, useMemo, useState } from 'react';

import { ResizedObjectInfo } from '../../types/streaming';

const THROTTLE_INTERVAL = 50;

type YDirection = 'bottomUp' | 'topDown';

const useDeviceInspector = (videoRef?: RefObject<HTMLVideoElement>) => {
  const [resizedObjectInfos, setResizedObjectInfos] = useState<ResizedObjectInfo[]>();
  const [hitPoint, setHitPoint] = useState<Vector3>();
  const [mouseEvent, setMouseEvent] = useState<React.MouseEvent<HTMLTextAreaElement, MouseEvent>>();

  const resetResizedObjectInfos = useCallback(() => {
    setTimeout(() => setResizedObjectInfos(undefined), THROTTLE_INTERVAL);
  }, []);

  const handleDumpHierarchy = useCallback(async (GamiumClient: GamiumClient | undefined) => {
    if (!GamiumClient) {
      return;
    }

    const result = await GamiumClient.inspector()
      .dumpHierarchy('', 0)
      .catch((e) => {
        console.warn(e);
        return [];
      });
    return result;
  }, []);

  const getObjectArea = useCallback(
    (deviceSize: Vector2, infos: ObjectInfo[], yDir: YDirection) => {
      if (!videoRef?.current) {
        return;
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

      setResizedObjectInfos(resizedInfos);
    },
    [videoRef],
  );

  const handleInspectOnScreen = useCallback(
    async (game: GamiumClient | undefined, event: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
      if (!game || event.currentTarget === null) {
        return;
      }

      try {
        setMouseEvent(event);
        const result = await game
          .inspector()
          .inspectOnPos(
            { x: event.nativeEvent.offsetX, y: event.currentTarget.clientHeight - event.nativeEvent.offsetY },
            { x: event.currentTarget.clientWidth, y: event.currentTarget.clientHeight },
          )
          .catch((e) => {
            console.warn(e);
            return undefined;
          });
        const screenSize = await game.screen();

        if (result?.infos) {
          getObjectArea({ x: screenSize.width, y: screenSize.height }, [result.infos?.[0]], 'bottomUp');
        }
        setHitPoint(result?.hitPoint ?? undefined);
      } catch (e) {
        console.warn(e);
      }
    },
    [getObjectArea],
  );

  const throttleInpsectOnScreen = useMemo(() => {
    const func = throttle((...args: Parameters<typeof handleInspectOnScreen>) => handleInspectOnScreen(...args), THROTTLE_INTERVAL);
    return func;
  }, [handleInspectOnScreen]);

  const handleInspectWithId = useCallback(
    async (GamiumClient: GamiumClient | undefined, objectId: string) => {
      console.warn('handleInspectWithId', objectId);

      if (!GamiumClient) {
        return;
      }

      try {
        const result = await GamiumClient.inspector()
          .inspect(objectId)
          .catch((e) => {
            console.warn(e);
            return undefined;
          });
        const screenSize = await GamiumClient.screen();

        if (result) {
          getObjectArea({ x: screenSize.width, y: screenSize.height }, [result], 'bottomUp');
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [getObjectArea],
  );

  return { resizedObjectInfos, hitPoint, mouseEvent, resetResizedObjectInfos, handleDumpHierarchy, throttleInpsectOnScreen, handleInspectWithId };
};

export default useDeviceInspector;
