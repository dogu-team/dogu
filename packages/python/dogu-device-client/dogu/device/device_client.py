import json
import time
from dataclasses import dataclass, asdict
from websockets.sync.client import connect, ClientConnection
from dogu.device.appium_server import AppiumContextServerInfo, AppiumServerContext
from dogu.device.common.device_closer import DeviceCloser
from dogu.device.logger import create_logger


@dataclass(frozen=True)
class DeviceForwardSendMessage:
    # pylint: disable=invalid-name
    serial: str
    # pylint: disable=invalid-name
    hostPort: int
    # pylint: disable=invalid-name
    devicePort: int


@dataclass(frozen=True)
class DeviceRunAppiumServerSendMessage:
    # pylint: disable=invalid-name
    serial: str


@dataclass(frozen=True)
class AppiumContextInfo:
    # pylint: disable=invalid-name
    serial: str
    # pylint: disable=invalid-name
    server: AppiumContextServerInfo


@dataclass(frozen=True)
class GetAppiumContextInfoResponse:
    info: AppiumContextInfo


class DeviceClient:
    def __init__(self, host: str, port: int, timeout: int):
        self.host = host
        self.port = port
        self._host_and_port = f"{self.host}:{self.port}"
        self.timeout = timeout
        self._logger = create_logger(__name__)

    def forward(self, serial: str, host_port: int, device_port: int) -> DeviceCloser:
        conn = self.__subscribe("/ws/devices/forward")
        param = DeviceForwardSendMessage(
            serial=serial, hostPort=host_port, devicePort=device_port
        )
        json_param = json.dumps(asdict(param))
        conn.send(json_param)
        while True:
            msg = conn.recv()
            msg_json = json.loads(msg)
            kind = msg_json["value"]["kind"]
            if kind != "DeviceForwardReceiveMessageResultValue":
                continue
            success = msg_json["value"]["success"]
            if not success:
                raise Exception(
                    f"Failed to forward. error: {msg_json['value']['error']}"
                )
            break
        return DeviceCloser(conn)

    def run_appium_server(self, serial: str) -> AppiumServerContext:
        conn = self.__subscribe("/ws/devices/run-appium-server")
        param = DeviceRunAppiumServerSendMessage(serial=serial)
        json_param = json.dumps(asdict(param))
        conn.send(json_param)
        while True:
            msg = conn.recv()
            msg_json = json.loads(msg)
            kind = msg_json["value"]["kind"]
            if kind != "DeviceRunAppiumServerReceiveMessageResultValue":
                continue
            success = msg_json["value"]["success"]
            if not success:
                raise Exception(
                    f"Failed to forward. error: {msg_json['value']['error']}"
                )
            break
        return AppiumServerContext(
            AppiumContextServerInfo(port=int(msg_json["value"]["serverPort"])), conn
        )

    def __subscribe(self, path: str, try_count: int = 5) -> ClientConnection:
        full_path = f"ws://{self._host_and_port}{path}"

        last_error = None
        for i in range(try_count):
            try:
                socket = connect(full_path)
                return socket
            except Exception as error:
                last_error = error
                self._logger.info(
                    "Failed to connect to %s. count: (%d/%d), error: %s",
                    full_path,
                    i + 1,
                    try_count,
                    error,
                )
                time.sleep(1)
                continue
        raise Exception(f"Failed to connect to {full_path}. error: {last_error}")
