from dogu.device import *


def test_connect():
    host = DeviceHostClient("127.0.0.1", 5001, 30)
    host_port = host.get_free_port()

    device = DeviceClient("127.0.0.1", 5001, 30)

    appium_server = device.run_appium_server("R39M20AQVAM")
    assert appium_server.port != 0

    capabilites = device.get_appium_capabilities("R39M20AQVAM")

    closer = device.forward("R39M20AQVAM", host_port, 12345)
    closer.close()
    appium_server.close()
