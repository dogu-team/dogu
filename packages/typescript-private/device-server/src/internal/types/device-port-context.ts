export type DevicePortContext = {
  deviceAgentForwardPort: number;
  deviceAgentSecondForwardPort: number;
};

export function DefaultDevicePortContext(): DevicePortContext {
  return {
    deviceAgentForwardPort: 0,
    deviceAgentSecondForwardPort: 0,
  };
}
