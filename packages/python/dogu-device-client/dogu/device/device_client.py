import json
import time
from dataclasses import dataclass, asdict
from typing import Any
import requests
from websockets.sync.client import connect, ClientConnection
from dogu.device.appium_server import AppiumContextServerInfo, AppiumServerContext
from dogu.device.common.device_closer import DeviceCloser
from dogu.device.common.device_http_response import DeviceHttpResponse
from dogu.device.common.const import (
    DOGU_DEVICE_AUTHORIZATION_HEADER_KEY,
    DOGU_DEVICE_SERIAL_HEADER_KEY,
)
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
    def __init__(self, device_server_url: str, token: str, timeout: int):
        self.device_server_url = (
            device_server_url
            if device_server_url[-1] != "/"
            else device_server_url[:-1]
        )
        self._token = token
        self.timeout = timeout
        self._logger = create_logger(__name__)

    def forward(self, serial: str, host_port: int, device_port: int) -> DeviceCloser:
        conn = self.__subscribe("/ws/devices/forward", serial=serial)
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
        conn = self.__subscribe("/ws/devices/run-appium-server", serial=serial)
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
                    f"Failed to run_appium_server. error: {msg_json['value']['error']}"
                )
            break
        return AppiumServerContext(
            AppiumContextServerInfo(port=int(msg_json["value"]["serverPort"])), conn
        )

    def get_appium_capabilities(self, serial: str) -> Any:
        full_path = f"{self.device_server_url}/devices/{serial}/appium-capabilities"
        headers = {}
        headers[DOGU_DEVICE_AUTHORIZATION_HEADER_KEY] = self._token

        res = requests.get(full_path, timeout=self.timeout, headers=headers)
        res.raise_for_status()
        device_res = DeviceHttpResponse(res)
        if device_res.error()[0]:
            raise Exception(
                f"DeviceClient.get_appium_capabilities error: {device_res.error()[1].message}"
            )
        return device_res.data_dict()["capabilities"]

    def __subscribe(
        self, path: str, serial: str, try_count: int = 5
    ) -> ClientConnection:
        ws_url = self.device_server_url.replace("http://", "ws://").replace(
            "https://", "wss://"
        )
        full_path = f"{ws_url}{path}"

        headers = {}
        headers[DOGU_DEVICE_AUTHORIZATION_HEADER_KEY] = self._token
        headers[DOGU_DEVICE_SERIAL_HEADER_KEY] = serial

        last_error = None
        for i in range(try_count):
            try:
                socket = connect(
                    full_path,
                    additional_headers=headers,
                )
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
