import json
import time
from dataclasses import dataclass, asdict
from typing import Dict

import requests
from dogu.device.common.device_http_response import DeviceHttpResponse
from dogu.device.logger import create_logger
from .closable import IClosable
from websockets.sync.client import connect, ClientConnection


class DeviceCloser(IClosable):
    def __init__(self, conn: ClientConnection):
        self.conn = conn

    def close(self) -> None:
        self.conn.close()


@dataclass(frozen=True)
class DeviceForwardSendMessage:
    # pylint: disable=invalid-name
    serial: str
    # pylint: disable=invalid-name
    hostPort: int
    # pylint: disable=invalid-name
    devicePort: int


@dataclass(frozen=True)
class AppiumContextServerInfo:
    # pylint: disable=invalid-name
    port: int
    # pylint: disable=invalid-name
    workingPath: str
    # pylint: disable=invalid-name
    command: str
    # pylint: disable=invalid-name
    env: Dict[str, str]


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

    def forward(self, serial: str, host_port: int, device_port: int) -> None:
        conn = self.__subscribe("/ws/devices/forward")
        param = DeviceForwardSendMessage(
            serial=serial, hostPort=host_port, devicePort=device_port
        )
        json_param = json.dumps(asdict(param))
        conn.send(json_param)
        while True:
            msg = conn.recv()
            msg = json.loads(msg)
            kind = msg["value"]["kind"]
            if kind != "DeviceForwardReceiveMessageResultValue":
                continue
            success = msg["value"]["success"]
            if not success:
                raise Exception(f"Failed to forward. error: {msg['value']['error']}")
            break
        return DeviceCloser(conn)

    def get_appium_context_info(self, serial: str) -> AppiumContextInfo:
        full_path = f"http://{self._host_and_port}/devices/{serial}/appium-channel-info"
        res = requests.get(full_path)
        res.raise_for_status()
        device_res = DeviceHttpResponse(res)
        if device_res.error()[0]:
            raise Exception(
                f"DeviceClient.get_appium_context_info error: {device_res.error()[1].message}"
            )
        res_obj = device_res.data(GetAppiumContextInfoResponse)
        return res_obj.info

    def __subscribe(self, path: str, try_count: int = 5) -> ClientConnection:
        full_path = f"ws://{self._host_and_port}{path}"

        last_error = None
        for i in range(try_count):
            try:
                socket = connect(full_path)
                return socket
            except Exception as e:
                last_error = e
                self._logger.info(
                    f"Failed to connect to {full_path}. count: ({i + 1}/{try_count}), error: {e}"
                )
                time.sleep(1)
                continue
        raise Exception(f"Failed to connect to {full_path}. error: {last_error}")
