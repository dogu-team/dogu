from dataclasses import dataclass
from websockets.sync.client import ClientConnection

from dogu.device.common.device_closer import DeviceCloser


@dataclass(frozen=True)
class AppiumContextServerInfo:
    # pylint: disable=invalid-name
    port: int


class AppiumServerContext:
    def __init__(self, info: AppiumContextServerInfo, conn: ClientConnection):
        self.info = info
        self.closer = DeviceCloser(conn)

    @property
    def port(self) -> int:
        return self.info.port

    def close(self) -> None:
        self.closer.close()
