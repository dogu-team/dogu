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
    use: false,
    devices: [
      {
        serial: '00008030-001C18E91443802E',
        webDriverPort: 10000,
        grpcPort: 10001,
      },
    ],
  },
};
