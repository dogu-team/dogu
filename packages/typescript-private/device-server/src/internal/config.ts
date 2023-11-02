export const config = {
  externalIosDeviceController: {
    use: false,
    port: 30001,
  },
  externalGoDeviceController: {
    use: false,
    port: 50055,
  },
  externalIosDeviceAgent: {
    use: true,
    webDriverPort: 10000,
    grpcPort: 10001,
  },
};
