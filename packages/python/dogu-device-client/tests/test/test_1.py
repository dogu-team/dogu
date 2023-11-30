from dogu.device.device_client import DeviceClient
from dogu.device.device_host_client import DeviceHostClient


def test_connect():
    host = DeviceHostClient(host="127.0.0.1", port=5001, token="token", timeout=30)
    host_port = host.get_free_port()

    device = DeviceClient(host="127.0.0.1", port=5001, token="token", timeout=30)

    appium_server = device.run_appium_server("ce041714512bd4ed0c")
    assert appium_server.port != 0

    capabilites = device.get_appium_capabilities("ce041714512bd4ed0c")

    closer = device.forward("ce041714512bd4ed0c", host_port, 12345)
    closer.close()
    appium_server.close()
