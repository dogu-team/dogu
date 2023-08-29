from dataclasses import asdict, dataclass
from typing import List, Optional
import requests
from dogu.device.common.device_http_response import DeviceHttpResponse
from dogu.device.logger import create_logger


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


class DeviceHostClient:
    def __init__(self, host: str, port: int, timeout: int = 10000):
        self.host = host
        self.port = port
        self._host_and_port = f"{self.host}:{self.port}"
        self.timeout = timeout
        self._logger = create_logger(__name__)

    def get_free_port(self, excludes: Optional[List[int]] = None) -> int:
        if not excludes:
            excludes = []
        full_path = f"http://{self._host_and_port}/device-host/free-port"
        param = GetFreePortQuery(excludes=excludes, offset=0)
        res = requests.get(full_path, json=asdict(param), timeout=self.timeout)
        res.raise_for_status()
        device_res = DeviceHttpResponse(res)
        if device_res.error()[0]:
            raise Exception(
                f"DeviceHostClient.get_free_port error: {device_res.error()[1].message}"
            )
        res_obj = device_res.data(GetFreePortResponse)
        return res_obj.port
