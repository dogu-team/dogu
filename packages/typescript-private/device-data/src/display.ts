import { Device, devices } from './device';

type DeviceArrayByDisplay = {
  [display: string]: Device[];
};

export const deviceArrayByDisplay: DeviceArrayByDisplay = {};

for (const device of devices) {
  const display = `${device.screen.viewportWidth}x${device.screen.viewportHeight}`;
  const deviceByDisplay = deviceArrayByDisplay[display];

  if (deviceByDisplay) {
    deviceByDisplay.push(device);
  } else {
    deviceArrayByDisplay[display] = [device];
  }
}
