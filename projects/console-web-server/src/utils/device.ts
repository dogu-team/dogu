import { deviceModels } from '../resources/device-models';

export const findDeviceModelNameByModelId = (modelId: string | null): string | null => {
  if (!modelId) {
    return null;
  }

  const key = Object.keys(deviceModels).find((id) => modelId === id);

  if (key) {
    return deviceModels[key as keyof typeof deviceModels];
  }

  return null;
};
