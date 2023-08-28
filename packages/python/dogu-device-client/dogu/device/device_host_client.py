from dataclasses import asdict, dataclass, field
from typing import List
import requests
from dogu.device.logger import create_logger
from .closable import IClosable


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
    def __init__(self, host: str, port: int, timeout: int):
        self.host = host
        self.port = port
        self._host_and_port = f"{self.host}:{self.port}"
        self.timeout = timeout
        self._logger = create_logger(__name__)

    def get_free_port(self, excludes: List[int] = []) -> int:
        full_path = f"http://{self._host_and_port}/device-host/free-port"
        param = asdict(GetFreePortQuery(excludes=excludes, offset=0))
        res = requests.get(full_path, json=param)
        res.raise_for_status()
        res_json = res.json()
        res_data = GetFreePortResponse(int(res_json["value"]["data"]["port"]))
        return res_data.port
