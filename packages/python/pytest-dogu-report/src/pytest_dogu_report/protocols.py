from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum, IntEnum, unique
from typing import Any, Dict, List, TypeVar
import os

import requests
from dacite import Config, from_dict


T = TypeVar("T")
DEFAULT_TIMEOUT = 60  # unit: seconds


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


@dataclass(frozen=True)
class UpdateDestStatusRequestBody:
    # pylint: disable=invalid-name
    destStatus: DestState

    # pylint: disable=invalid-name
    localTimeStamp: str


@dataclass(frozen=True)
class CreateDestRequestBody:
    # pylint: disable=invalid-name
    stepId: int

    # pylint: disable=invalid-name
    destInfos: List[DestInfo] = field(default_factory=list)


@dataclass(frozen=True)
class DestData:
    # pylint: disable=invalid-name
    destId: int

    # pylint: disable=invalid-name
    routineStepId: int
    name: str
    index: int
    state: DestState
    type: DestType
    children: List["DestData"] = field(default_factory=list)


@dataclass(frozen=True)
class CreateDestResponse:
    dests: List[DestData] = field(default_factory=list)


@dataclass(frozen=True)
class StepOptions:
    api_base_url: str
    organization_id: str
    device_id: str
    step_id: str
    host_token: str


class StepOptionsFactory:
    def create(self):
        api_base_url = os.environ.get("DOGU_API_BASE_URL", "")
        organization_id = os.environ.get("DOGU_ORGANIZATION_ID", "")
        device_id = os.environ.get("DOGU_DEVICE_ID", "")
        step_id = os.environ.get("DOGU_STEP_ID", "")
        host_token = os.environ.get("DOGU_HOST_TOKEN", "")
        step_options = StepOptions(
            api_base_url, organization_id, device_id, step_id, host_token
        )
        return step_options


class StepReportClient:
    def __init__(self, options: StepOptions):
        self.options = options

    def create_dest(self, dest_infos: List[DestInfo]) -> List[DestData]:
        url = f"{self.options.api_base_url}/public/organizations/{self.options.organization_id}/devices/{self.options.device_id}/dests"
        headers = self._create_headers()
        request_body = CreateDestRequestBody(
            stepId=int(self.options.step_id), destInfos=dest_infos
        )
        request_body_raw = self._create_request_body_raw(request_body)
        response = requests.post(
            url, json=request_body_raw, headers=headers, timeout=DEFAULT_TIMEOUT
        )
        response.raise_for_status()
        response_body_raw = response.json()
        response_body = self._create_response_body(
            CreateDestResponse, response_body_raw
        )
        return response_body.dests

    def update_dest_status(self, dest_id: str, status: DestState, local_time: datetime):
        url = f"{self.options.api_base_url}/public/organizations/{self.options.organization_id}/devices/{self.options.device_id}/dests/{dest_id}/status"
        headers = self._create_headers()
        request_body = UpdateDestStatusRequestBody(
            destStatus=status, localTimeStamp=local_time.isoformat()
        )
        request_body_raw = self._create_request_body_raw(request_body)
        response = requests.patch(
            url, json=request_body_raw, headers=headers, timeout=DEFAULT_TIMEOUT
        )
        response.raise_for_status()

    def _create_headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.options.host_token}"}

    def _create_request_body_raw(self, dto: Any) -> Dict[str, Any]:
        def _convert_value(obj):
            if isinstance(obj, IntEnum):
                return obj.value
            return obj

        def _convert_dict(obj):
            return {k: _convert_value(v) for k, v in obj}

        return asdict(dto, dict_factory=_convert_dict)

    def _create_response_body(self, cls: T, dto_raw: Dict[str, Any]) -> T:
        return from_dict(data_class=cls, data=dto_raw, config=Config(cast=[Enum]))
