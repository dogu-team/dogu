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
        serial: '33611c72d0429eddfefeec2f29b7a8eee69a7bdd',
        webDriverPort: 10000,
        grpcPort: 35002,
      },
    ],
  },
};
