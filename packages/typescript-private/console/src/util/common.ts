import { ScreenSize } from '@dogu-tech/device-client-common';

export function getDevicePositionByVideoPosition(
  deviceSize: ScreenSize,
  videoScreenSize: ScreenSize,
  videoScreenPositionX: number,
  videoScreenPositionY: number,
): { x: number; y: number } {
  const deviceWidth = deviceSize.width;
  const deviceHeight = deviceSize.height;

  const videoWidth = videoScreenSize.width;
  const videoHeight = videoScreenSize.height;

  const videoPositionX = videoScreenPositionX;
  const videoPositionY = videoScreenPositionY;

  const devicePositionX = (videoPositionX * deviceWidth) / videoWidth;
  const devicePositionY = (videoPositionY * deviceHeight) / videoHeight;

  return { x: devicePositionX, y: devicePositionY };
}
