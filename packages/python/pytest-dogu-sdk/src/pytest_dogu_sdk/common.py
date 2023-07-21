from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass, field
from enum import Enum, IntEnum, unique
from typing import Any, Dict, List, Optional, Tuple, Type, TypeVar

from dacite import Config, from_dict
from pytest import Item, Session, TestReport
import requests

from .dogu_config import DoguConfig


T = TypeVar("T")


DEFAULT_REQUEST_TIMEOUT = 60  # unit: seconds


PyTestLocation = Tuple[str, Optional[int], str]


@unique
class DestType(IntEnum):
    JOB = 0
    UNIT = 1


@unique
class DestState(IntEnum):
    UNSPECIFIED = 0
    PENDING = 1
    RUNNING = 2
    FAILED = 3
    PASSED = 4
    SKIPPED = 5

    def is_completed(self) -> bool:
        return self in _dest_completed_states


_dest_completed_states = (DestState.FAILED, DestState.PASSED, DestState.SKIPPED)


@dataclass(frozen=True)
class DestInfo:
    name: str
    type: DestType
    children: List["DestInfo"] = field(default_factory=list)


def create_request_body_raw(dto: Any) -> Dict[str, Any]:
    def _convert_value(obj):
        if isinstance(obj, IntEnum):
            return obj.value
        return obj

    def _convert_dict(obj):
        return {k: _convert_value(v) for k, v in obj}

    return asdict(dto, dict_factory=_convert_dict)


def create_response_body(cls: T, dto_raw: Dict[str, Any]) -> T:
    return from_dict(data_class=cls, data=dto_raw, config=Config(cast=[Enum]))


def request_post(
    url: str, headers: Dict[str, str], request_body_raw: Dict[str, Any]
) -> Dict[str, Any]:
    response = requests.post(
        url, json=request_body_raw, headers=headers, timeout=DEFAULT_REQUEST_TIMEOUT
    )
    response.raise_for_status()
    response_body_raw = response.json()
    return response_body_raw


def find_item(items: List[Item], nodeid: str) -> Optional[Item]:
    for item in items:
        if item.nodeid == nodeid:
            return item
    return None


class PyTestHandler(ABC):
    @abstractmethod
    def on_pytest_collection_modifyitems(
        self, session: Session, config: Config, items: List[Item]
    ) -> None:
        pass

    @abstractmethod
    def on_pytest_runtest_logstart(self, nodeid: str, location: PyTestLocation) -> None:
        pass

    @abstractmethod
    def on_pytest_runtest_logfinish(
        self, nodeid: str, location: PyTestLocation
    ) -> None:
        pass

    @abstractmethod
    def on_pytest_runtest_logreport(self, report: TestReport) -> None:
        pass


class NullDestReporter(PyTestHandler):
    def on_pytest_collection_modifyitems(
        self, session: Session, config: Config, items: List[Item]
    ) -> None:
        pass

    def on_pytest_runtest_logstart(self, nodeid: str, location: PyTestLocation) -> None:
        pass

    def on_pytest_runtest_logfinish(
        self, nodeid: str, location: PyTestLocation
    ) -> None:
        pass

    def on_pytest_runtest_logreport(self, report: TestReport) -> None:
        pass


class DoguClient(ABC):
    def __init__(self) -> None:
        super().__init__()
        self.impl: Optional[T] = None

    @abstractmethod
    def on_setup(self, dogu_config: DoguConfig) -> Any:
        pass

    @property
    @abstractmethod
    def dogu_results(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def on_teardown(self) -> None:
        pass

    def cast(self, cls: Type[T]) -> T:
        if not isinstance(self.impl, cls):
            raise Exception(f"impl is not an instance of {cls}")
        return self.impl
