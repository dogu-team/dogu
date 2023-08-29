from typing import Any, TypeVar, TypedDict
from dacite import from_dict

from requests import Response

T = TypeVar("T")


class DeviceError(TypedDict):
    code: int
    message: str


class DeviceHttpResponse:
    def __init__(self, res: Response):
        self.res_json = res.json()

    def error(self) -> [bool, DeviceError]:
        if self.res_json["value"]["$case"] != "error":
            return False, DeviceError(code=0, message="")

        return True, DeviceError(
            code=self.res_json["value"]["error"]["code"],
            message=self.res_json["value"]["error"]["message"],
        )

    def data(self, cls: T) -> T:
        data_dict = self.__data_dict()
        return from_dict(data_class=cls, data=data_dict)

    def __data_dict(self) -> Any:
        if self.res_json["value"]["$case"] != "data":
            raise Exception("DeviceHttpResponse not a data type")
        return self.res_json["value"]["data"]
