from dataclasses import dataclass, field
from typing import Dict, List

import requests

from .common import (
    DEFAULT_REQUEST_TIMEOUT,
    DestInfo,
    DestState,
    DestType,
    create_request_body_raw,
    create_response_body,
)


RoutineDestInfo = DestInfo


@dataclass(frozen=True)
class UpdateRoutineDestStatusRequestBody:
    # pylint: disable=invalid-name
    destStatus: DestState
    # pylint: disable=invalid-name
    localTimeStamp: str


@dataclass(frozen=True)
class CreateRoutineDestRequestBody:
    # pylint: disable=invalid-name
    stepId: int
    # pylint: disable=invalid-name
    destInfos: List[RoutineDestInfo] = field(default_factory=list)


@dataclass(frozen=True)
class RoutineDestData:
    # pylint: disable=invalid-name
    destId: int
    # pylint: disable=invalid-name
    routineStepId: int
    name: str
    index: int
    state: DestState
    type: DestType
    children: List["RoutineDestData"] = field(default_factory=list)


@dataclass(frozen=True)
class CreateRoutineDestResponse:
    dests: List[RoutineDestData] = field(default_factory=list)


@dataclass(frozen=True)
class RoutineDestOptions:
    api_base_url: str
    organization_id: str
    device_id: str
    step_id: str
    host_token: str


class RoutineDestReportClient:
    def __init__(self, options: RoutineDestOptions):
        self.options = options

    def create_routine_dest(
        self, dest_infos: List[RoutineDestInfo]
    ) -> List[RoutineDestData]:
        url = f"{self.options.api_base_url}/public/organizations/{self.options.organization_id}/devices/{self.options.device_id}/dests"
        headers = self._create_headers()
        request_body = CreateRoutineDestRequestBody(
            stepId=int(self.options.step_id), destInfos=dest_infos
        )
        request_body_raw = create_request_body_raw(request_body)
        response = requests.post(
            url, json=request_body_raw, headers=headers, timeout=DEFAULT_REQUEST_TIMEOUT
        )
        response.raise_for_status()
        response_body_raw = response.json()
        response_body = create_response_body(
            CreateRoutineDestResponse, response_body_raw
        )
        return response_body.dests

    def update_routine_dest_state(
        self, routine_dest_id: str, routine_dest_state: DestState, local_time_stamp: str
    ):
        url = f"{self.options.api_base_url}/public/organizations/{self.options.organization_id}/devices/{self.options.device_id}/dests/{routine_dest_id}/status"
        headers = self._create_headers()
        request_body = UpdateRoutineDestStatusRequestBody(
            destStatus=routine_dest_state, localTimeStamp=local_time_stamp
        )
        request_body_raw = create_request_body_raw(request_body)
        response = requests.patch(
            url, json=request_body_raw, headers=headers, timeout=DEFAULT_REQUEST_TIMEOUT
        )
        response.raise_for_status()

    def _create_headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.options.host_token}"}
