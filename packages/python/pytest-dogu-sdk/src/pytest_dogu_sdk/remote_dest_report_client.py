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
    request_post,
)


RemoteDestInfo = DestInfo


@dataclass(frozen=True)
class UpdateRemoteDestStateRequestBody:
    # pylint: disable=invalid-name
    remoteDestState: DestState
    # pylint: disable=invalid-name
    localTimeStamp: str


@dataclass(frozen=True)
class CreateRemoteDestRequestBody:
    # pylint: disable=invalid-name
    remoteDestInfos: List[RemoteDestInfo] = field(default_factory=list)


@dataclass(frozen=True)
class RemoteDestData:
    # pylint: disable=invalid-name
    remoteDestId: str
    # pylint: disable=invalid-name
    remoteDeviceJobId: str
    name: str
    index: int
    state: DestState
    type: DestType
    children: List["RemoteDestData"] = field(default_factory=list)


@dataclass(frozen=True)
class CreateRemoteDestResponse:
    dests: List[RemoteDestData] = field(default_factory=list)


@dataclass(frozen=True)
class RemoteDestOptions:
    api_base_url: str
    project_id: str
    remote_device_job_id: str
    token: str


class RemoteDestReportClient:
    def __init__(self, options: RemoteDestOptions):
        self.options = options

    def create_remote_dest(
        self, dest_infos: List[RemoteDestInfo]
    ) -> List[RemoteDestData]:
        url = f"{self.options.api_base_url}/public/projects/{self.options.project_id}/remote-device-jobs/{self.options.remote_device_job_id}/remote-dests"
        headers = self._create_headers()
        request_body = CreateRemoteDestRequestBody(remoteDestInfos=dest_infos)
        request_body_raw = create_request_body_raw(request_body)
        response_body_raw = request_post(url, headers, request_body_raw)
        response_body = create_response_body(
            CreateRemoteDestResponse, response_body_raw
        )
        return response_body.dests

    def update_remote_dest_state(
        self, remote_dest_id: str, remote_dest_state: DestState, local_time_stamp: str
    ):
        url = f"{self.options.api_base_url}/public/projects/{self.options.project_id}/remote-device-jobs/{self.options.remote_device_job_id}/remote-dests/{remote_dest_id}/state"
        headers = self._create_headers()
        request_body = UpdateRemoteDestStateRequestBody(
            remoteDestState=remote_dest_state, localTimeStamp=local_time_stamp
        )
        request_body_raw = create_request_body_raw(request_body)
        response = requests.patch(
            url, json=request_body_raw, headers=headers, timeout=DEFAULT_REQUEST_TIMEOUT
        )
        response.raise_for_status()

    def _create_headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.options.token}"}
