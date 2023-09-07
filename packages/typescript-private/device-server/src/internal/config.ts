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
        serial: '54f523f21b76e07c62c69c14a1d141269515313d',
        webDriverPort: 10000,
        grpcPort: 10001,
      },
    ],
  },
};
