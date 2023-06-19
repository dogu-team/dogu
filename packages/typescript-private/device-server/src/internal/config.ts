export const config = {
  externalIosDeviceController: {
    use: false,
    port: 30001,
  },
  externalPionStreamer: {
    use: false,
    port: 50055,
  },
  externalIosDeviceAgent: {
    use: false,
    devices: [
      {
        serial: '880ecd84786a137defe1fe49ed0d6d471838dafb',
        webDriverPort: 10000,
        grpcPort: 10001,
      },
    ],
  },
};
