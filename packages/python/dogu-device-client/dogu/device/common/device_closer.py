from websockets.sync.client import ClientConnection
from dogu.device.common.closable import IClosable


class DeviceCloser(IClosable):
    def __init__(self, conn: ClientConnection):
        self.conn = conn

    def close(self) -> None:
        self.conn.close()
