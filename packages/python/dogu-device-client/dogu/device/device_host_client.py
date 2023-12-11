from dataclasses import asdict, dataclass
from typing import List, Optional
import requests
from dogu.device.common.device_http_response import DeviceHttpResponse
from dogu.device.logger import create_logger
from dogu.device.common.const import DOGU_DEVICE_AUTHORIZATION_HEADER_KEY


@dataclass(frozen=True)
class GetFreePortQuery:
    # pylint: disable=invalid-name
    excludes: List[int]
    # pylint: disable=invalid-name
    offset: int


@dataclass(frozen=True)
class GetFreePortResponse:
    # pylint: disable=invalid-name
    port: int


@dataclass(frozen=True)
class EnsureBrowserAndDriverOptions:
    # pylint: disable=invalid-name
    browserName: str

    # pylint: disable=invalid-name
    browserPlatform: str

    # pylint: disable=invalid-name
    browserVersion: Optional[str]

    # pylint: disable=invalid-name
    deviceSerial: Optional[str]


# pylint: disable=too-many-instance-attributes
@dataclass(frozen=True)
class EnsureBrowserAndDriverResult:
    # pylint: disable=invalid-name
    browserName: str

    # pylint: disable=invalid-name
    browserPlatform: str

    # pylint: disable=invalid-name
    browserVersion: str

    # pylint: disable=invalid-name
    browserMajorVersion: int

    # pylint: disable=invalid-name
    browserDriverVersion: str

    # pylint: disable=invalid-name
    browserDriverPath: str

    # pylint: disable=invalid-name
    browserPath: Optional[str]

    # pylint: disable=invalid-name
    browserPackageName: Optional[str]

    # pylint: disable=invalid-name
    deviceSerial: Optional[str]


class DeviceHostClient:
    def __init__(self, device_server_url: str, token: str, timeout: int = 10):
        self.device_server_url = (
            device_server_url
            if device_server_url[-1] != "/"
            else device_server_url[:-1]
        )
        self._token = token
        self.timeout = timeout
        self._logger = create_logger(__name__)

    def get_free_port(self, excludes: Optional[List[int]] = None) -> int:
        if not excludes:
            excludes = []
        full_path = f"{self.device_server_url}/device-host/free-port"
        param = GetFreePortQuery(excludes=excludes, offset=0)
        headers = {}
        headers[DOGU_DEVICE_AUTHORIZATION_HEADER_KEY] = self._token

        res = requests.get(
            full_path, json=asdict(param), timeout=self.timeout, headers=headers
        )
        res.raise_for_status()
        device_res = DeviceHttpResponse(res)
        if device_res.error()[0]:
            raise Exception(
                f"DeviceHostClient.get_free_port error: {device_res.error()[1].message}"
            )
        res_obj = device_res.data(GetFreePortResponse)
        return res_obj.port

    def ensure_browser_and_driver(
        self, options: EnsureBrowserAndDriverOptions
    ) -> EnsureBrowserAndDriverResult:
        full_path = f"{self.device_server_url}/device-host/ensure-browser-and-driver"
        headers = {}
        headers[DOGU_DEVICE_AUTHORIZATION_HEADER_KEY] = self._token

        res = requests.post(
            full_path, json=asdict(options), timeout=self.timeout, headers=headers
        )
        res.raise_for_status()
        device_res = DeviceHttpResponse(res)
        if device_res.error()[0]:
            raise Exception(
                f"DeviceHostClient.ensure_browser_and_driver error: {device_res.error()[1].message}"
            )
        res_obj = device_res.data(EnsureBrowserAndDriverResult)
        return res_obj
