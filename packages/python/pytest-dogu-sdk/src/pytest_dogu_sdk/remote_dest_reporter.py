from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional

from pytest import Config, Item, Session, StashKey, TestReport

from .dogu_config import DoguConfig
from .remote_dest_report_client import (
    RemoteDestData,
    RemoteDestInfo,
    RemoteDestReportClient,
)
from .common import (
    DoguClient,
    PyTestHandler,
    DestState,
    DestType,
    NullDestReporter,
    PyTestLocation,
    find_item,
)


@dataclass(frozen=True)
class RemoteDestOptions:
    api_base_url: str
    project_id: str
    token: str
    remote_device_job_id: str


@dataclass
class RemoteUnitInfo:
    remote_dest_id: str
    state: DestState = DestState.PENDING
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None


remote_unit_info_key = StashKey()


@dataclass
class RemoteJobInfo:
    remote_dest_id: str
    state: DestState = DestState.PENDING
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    children: List[RemoteUnitInfo] = field(default_factory=list)


remote_job_info_key = StashKey()


@dataclass
class ParseNodeidResult:
    remote_job_name: str
    remote_unit_name: str


def _parse_nodeid(nodeid: str) -> ParseNodeidResult:
    parsed_id = nodeid.split("::")
    if len(parsed_id) != 2:
        raise Exception(f"nodeid {nodeid} is invalid")
    return ParseNodeidResult(
        remote_job_name=parsed_id[0], remote_unit_name=parsed_id[1]
    )


def _get_remote_job_info(item: Item) -> RemoteJobInfo:
    if remote_job_info_key not in item.stash:
        raise Exception(f"remote_job_info is not found in {item.nodeid}")
    job_info = item.stash[remote_job_info_key]
    if job_info is None:
        raise Exception(f"remote_job_info is not found in {item.nodeid}")
    return job_info


def _get_remote_unit_info(item: Item) -> RemoteUnitInfo:
    if remote_unit_info_key not in item.stash:
        raise Exception(f"remote_unit_info is not found in {item.nodeid}")
    unit_info = item.stash[remote_unit_info_key]
    if unit_info is None:
        raise Exception(f"remote_unit_info is not found in {item.nodeid}")
    return unit_info


class RemoteDestReporter(PyTestHandler):
    def __init__(self, options: RemoteDestOptions):
        self._client = RemoteDestReportClient(options)
        self._item_map_for_remote: Dict[str, Item] = {}

    def on_pytest_collection_modifyitems(
        self, session: Session, config: Config, items: List[Item]
    ) -> None:
        dest_infos = self._create_dest_infos(items)
        dest_datas = self._client.create_remote_dest(dest_infos)
        self._stash_items(items, dest_datas)

    def on_pytest_runtest_logstart(self, nodeid: str, location: PyTestLocation) -> None:
        item = self._item_map_for_remote.get(nodeid)
        if item is None:
            raise Exception(f"nodeid {nodeid} is not found")
        job_info = _get_remote_job_info(item)
        if job_info.state == DestState.PENDING:
            job_info.started_at = datetime.now()
            job_info.state = DestState.RUNNING
            self._client.update_remote_dest_state(
                job_info.remote_dest_id, job_info.state, job_info.started_at.isoformat()
            )

        unit_info = _get_remote_unit_info(item)
        unit_info.started_at = datetime.now()
        unit_info.state = DestState.RUNNING
        self._client.update_remote_dest_state(
            unit_info.remote_dest_id, unit_info.state, unit_info.started_at.isoformat()
        )

    def on_pytest_runtest_logfinish(
        self, nodeid: str, location: PyTestLocation
    ) -> None:
        item = self._item_map_for_remote.get(nodeid)
        if item is None:
            raise Exception(f"nodeid {nodeid} is not found")
        unit_info = _get_remote_unit_info(item)
        self._client.update_remote_dest_state(
            unit_info.remote_dest_id, unit_info.state, unit_info.finished_at.isoformat()
        )

        job_info = _get_remote_job_info(item)
        if all(child.state.is_completed() for child in job_info.children):
            self._client.update_remote_dest_state(
                job_info.remote_dest_id,
                job_info.state,
                job_info.finished_at.isoformat(),
            )

    def on_pytest_runtest_logreport(self, report: TestReport) -> None:
        if report.when != "call":
            return

        item = self._item_map_for_remote.get(report.nodeid)
        if item is None:
            raise Exception(f"nodeid {report.nodeid} is not found for remote dest")
        remote_unit_info = _get_remote_unit_info(item)
        remote_unit_info.finished_at = datetime.now()
        if report.passed:
            remote_unit_info.state = DestState.PASSED
        elif report.failed:
            remote_unit_info.state = DestState.FAILED
        elif report.skipped:
            remote_unit_info.state = DestState.SKIPPED
        else:
            raise Exception(f"unknown report state {report.outcome}")

        remote_job_info = _get_remote_job_info(item)
        if all(child.state.is_completed() for child in remote_job_info.children):
            remote_job_info.finished_at = datetime.now()
            if all(
                child.state == DestState.PASSED for child in remote_job_info.children
            ):
                remote_job_info.state = DestState.PASSED
            elif any(
                child.state == DestState.FAILED for child in remote_job_info.children
            ):
                remote_job_info.state = DestState.FAILED
            elif any(
                child.state == DestState.SKIPPED for child in remote_job_info.children
            ):
                remote_job_info.state = DestState.SKIPPED
            else:
                raise Exception(f"unknown job state {remote_job_info.state}")

    def _create_dest_infos(self, items: List[Item]) -> List[RemoteDestInfo]:
        temp_dest_info_map: Dict[str, RemoteDestInfo] = {}
        for item in items:
            parse_result = _parse_nodeid(item.nodeid)
            remote_job_name = parse_result.remote_job_name
            if remote_job_name not in temp_dest_info_map:
                temp_dest_info_map[remote_job_name] = RemoteDestInfo(
                    name=remote_job_name, type=DestType.JOB
                )
            job_dest_info = temp_dest_info_map[remote_job_name]

            unit_dest_info = RemoteDestInfo(name=item.name, type=DestType.UNIT)
            job_dest_info.children.append(unit_dest_info)
        return list(temp_dest_info_map.values())

    def _stash_items(self, items: List[Item], dest_datas: List[RemoteDestData]) -> None:
        temp_remote_job_info_map: Dict[str, RemoteJobInfo] = {}
        for dest_data in dest_datas:
            self._stash_item(None, dest_data, items, temp_remote_job_info_map)

    def _stash_item(
        self,
        parent_remote_dest_data: Optional[RemoteDestData],
        current_remote_dest_data: RemoteDestData,
        items: List[Item],
        temp_remote_job_info_map: Dict[str, RemoteJobInfo],
    ) -> None:
        if current_remote_dest_data.type == DestType.JOB:
            if parent_remote_dest_data is not None:
                raise Exception(
                    f"parent is not None for {current_remote_dest_data.name}"
                )

            if current_remote_dest_data.name not in temp_remote_job_info_map:
                temp_remote_job_info_map[current_remote_dest_data.name] = RemoteJobInfo(
                    remote_dest_id=current_remote_dest_data.remoteDestId
                )

            for child in current_remote_dest_data.children:
                self._stash_item(
                    current_remote_dest_data, child, items, temp_remote_job_info_map
                )
        elif current_remote_dest_data.type == DestType.UNIT:
            if parent_remote_dest_data is None:
                raise Exception(f"parent is None for {current_remote_dest_data.name}")

            nodeid = f"{parent_remote_dest_data.name}::{current_remote_dest_data.name}"
            item = find_item(items, nodeid)
            if item is None:
                raise Exception(f"item is not found for {nodeid}")

            self._item_map_for_remote[nodeid] = item

            remote_unit_info = RemoteUnitInfo(
                remote_dest_id=current_remote_dest_data.remoteDestId
            )
            item.stash[remote_unit_info_key] = remote_unit_info

            remote_job_info = temp_remote_job_info_map[parent_remote_dest_data.name]
            remote_job_info.children.append(remote_unit_info)
            item.stash[remote_job_info_key] = remote_job_info
        else:
            raise Exception(f"unknown remote dest type {current_remote_dest_data.type}")


class RemoteDestReporterFactory:
    def __init__(self, dogu_config: DoguConfig, client: DoguClient):
        self._dogu_config = dogu_config
        self._client = client

    def create(self) -> PyTestHandler:
        try:
            dogu_results = self._client.dogu_results
            remote_device_job_id = dogu_results["remoteDeviceJobId"]
            options = RemoteDestOptions(
                api_base_url=self._dogu_config.api_base_url,
                project_id=self._dogu_config.project_id,
                token=self._dogu_config.token,
                remote_device_job_id=remote_device_job_id,
            )
            return RemoteDestReporter(options)
        except Exception as exception:
            print(
                f"[dogu] failed to create RemoteDestReporter. fallback to NullDestReporter. error: {exception}"
            )
            return NullDestReporter()
