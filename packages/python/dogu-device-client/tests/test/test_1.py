from dogu.device import *


def test_connect():
    host = DeviceHostClient("127.0.0.1", 5001, 30)
    host_port = host.get_free_port()

    device = DeviceClient("127.0.0.1", 5001, 30)

    appium = device.get_appium_context_info("R39M20AQVAM")
    assert appium.server.port != 0
    closer = device.forward("R39M20AQVAM", host_port, 12345)
    closer.close()

    pass
