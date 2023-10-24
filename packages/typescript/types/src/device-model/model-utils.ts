import { DeviceModels } from '..';

export function findDeviceModelNameByModelId(modelId: string): string | null {
  if (!modelId) {
    return null;
  }

  const key = Object.keys(DeviceModels).find((id) => modelId === id);

  if (key) {
    return DeviceModels[key as keyof typeof DeviceModels];
  }

  return null;
}
