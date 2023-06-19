export type DeviceAppInfo = {
  name: string;
  fs: {
    appSize: number;
    cacheSize: number;
  };
};

export const DefaultDeviceAppInfo: () => DeviceAppInfo = () => {
  return {
    name: '',
    fs: {
      appSize: 0,
      cacheSize: 0,
    },
  };
};
