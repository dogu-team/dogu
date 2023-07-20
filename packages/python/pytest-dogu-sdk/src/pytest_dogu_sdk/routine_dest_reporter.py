from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional

from pytest import Config, Item, Session, TestReport, StashKey

from .dogu_config import DoguConfig
from .routine_dest_report_client import (
    RoutineDestData,
    RoutineDestOptions,
    RoutineDestReportClient,
)
from .common import (
    DestInfo,
    PyTestHandler,
    DestState,
    DestType,
    NullDestReporter,
    PyTestLocation,
    find_item,
)


@dataclass
class RoutineUnitInfo:
    routine_dest_id: str
    state: DestState = DestState.PENDING
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None


routine_unit_info_key = StashKey()


@dataclass
class RoutineJobInfo:
    routine_dest_id: str
    state: DestState = DestState.PENDING
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    children: List[RoutineUnitInfo] = field(default_factory=list)


routine_job_info_key = StashKey()


@dataclass
class ParseNodeidResult:
    routine_job_name: str
    routine_unit_name: str


def _parse_nodeid(nodeid: str) -> ParseNodeidResult:
    parsed_id = nodeid.split("::")
    if len(parsed_id) != 2:
        raise Exception(f"nodeid {nodeid} is invalid")
    return ParseNodeidResult(
        routine_job_name=parsed_id[0], routine_unit_name=parsed_id[1]
    )


def _get_routine_job_info(item: Item) -> RoutineJobInfo:
    if routine_job_info_key not in item.stash:
        raise Exception(f"routine_job_info is not found in {item.nodeid}")
    job_info = item.stash[routine_job_info_key]
    if job_info is None:
        raise Exception(f"routine_job_info is not found in {item.nodeid}")
    return job_info


def _get_routine_unit_info(item: Item) -> RoutineUnitInfo:
    if routine_unit_info_key not in item.stash:
        raise Exception(f"routine_unit_info is not found in {item.nodeid}")
    unit_info = item.stash[routine_unit_info_key]
    if unit_info is None:
        raise Exception(f"routine_unit_info is not found in {item.nodeid}")
    return unit_info


class RoutineDestReporter(PyTestHandler):
    def __init__(self, options: RoutineDestOptions):
        self._client = RoutineDestReportClient(options)
        self._item_map_for_routine: Dict[str, Item] = {}

    def on_pytest_collection_modifyitems(
        self, session: Session, config: Config, items: List[Item]
    ) -> None:
        dest_infos = self._create_dest_infos(items)
        dest_datas = self._client.create_routine_dest(dest_infos)
        self._stash_items(items, dest_datas)

    def on_pytest_runtest_logstart(self, nodeid: str, location: PyTestLocation) -> None:
        item = self._item_map_for_routine.get(nodeid)
        if item is None:
            raise Exception(f"nodeid {nodeid} is not found")
        routine_job_info = _get_routine_job_info(item)
        if routine_job_info.state == DestState.PENDING:
            routine_job_info.started_at = datetime.now()
            routine_job_info.state = DestState.RUNNING
            self._client.update_routine_dest_state(
                routine_job_info.routine_dest_id,
                routine_job_info.state,
                routine_job_info.started_at.isoformat(),
            )

        routine_unit_info = _get_routine_unit_info(item)
        routine_unit_info.started_at = datetime.now()
        routine_unit_info.state = DestState.RUNNING
        self._client.update_routine_dest_state(
            routine_unit_info.routine_dest_id,
            routine_unit_info.state,
            routine_unit_info.started_at.isoformat(),
        )

    def on_pytest_runtest_logfinish(
        self, nodeid: str, location: PyTestLocation
    ) -> None:
        item = self._item_map_for_routine.get(nodeid)
        if item is None:
            raise Exception(f"nodeid {nodeid} is not found")
        unit_info = _get_routine_unit_info(item)
        self._client.update_routine_dest_state(
            unit_info.routine_dest_id,
            unit_info.state,
            unit_info.finished_at.isoformat(),
        )

        job_info = _get_routine_job_info(item)
        if all(child.state.is_completed() for child in job_info.children):
            self._client.update_routine_dest_state(
                job_info.routine_dest_id,
                job_info.state,
                job_info.finished_at.isoformat(),
            )

    def on_pytest_runtest_logreport(self, report: TestReport) -> None:
        if report.when != "call":
            return

        item = self._item_map_for_routine.get(report.nodeid)
        if item is None:
            raise Exception(f"nodeid {report.nodeid} is not found for routine dest")
        unit_info = _get_routine_unit_info(item)
        unit_info.finished_at = datetime.now()
        if report.passed:
            unit_info.state = DestState.PASSED
        elif report.failed:
            unit_info.state = DestState.FAILED
        elif report.skipped:
            unit_info.state = DestState.SKIPPED
        else:
            raise Exception(f"unknown report state {report.outcome}")

        job_info = _get_routine_job_info(item)
        if all(child.state.is_completed() for child in job_info.children):
            job_info.finished_at = datetime.now()
            if all(child.state == DestState.PASSED for child in job_info.children):
                job_info.state = DestState.PASSED
            elif any(child.state == DestState.FAILED for child in job_info.children):
                job_info.state = DestState.FAILED
            elif any(child.state == DestState.SKIPPED for child in job_info.children):
                job_info.state = DestState.SKIPPED
            else:
                raise Exception(f"unknown job state {job_info.state}")

    def _create_dest_infos(self, items: List[Item]) -> List[DestInfo]:
        temp_dest_info_map: Dict[str, DestInfo] = {}
        for item in items:
            parse_result = _parse_nodeid(item.nodeid)
            routine_job_name = parse_result.routine_job_name
            if routine_job_name not in temp_dest_info_map:
                temp_dest_info_map[routine_job_name] = DestInfo(
                    name=routine_job_name, type=DestType.JOB
                )
            job_dest_info = temp_dest_info_map[routine_job_name]

            unit_dest_info = DestInfo(name=item.name, type=DestType.UNIT)
            job_dest_info.children.append(unit_dest_info)
        return list(temp_dest_info_map.values())

    def _stash_items(
        self, items: List[Item], dest_datas: List[RoutineDestData]
    ) -> None:
        temp_routine_job_info_map: Dict[str, RoutineJobInfo] = {}
        for dest_data in dest_datas:
            self._stash_item(None, dest_data, items, temp_routine_job_info_map)

    def _stash_item(
        self,
        parent_routine_dest_data: Optional[RoutineDestData],
        current_routine_dest_data: RoutineDestData,
        items: List[Item],
        temp_routine_job_info_map: Dict[str, RoutineJobInfo],
    ) -> None:
        if current_routine_dest_data.type == DestType.JOB:
            if parent_routine_dest_data is not None:
                raise Exception(
                    f"parent is not None for {current_routine_dest_data.name}"
                )

            if current_routine_dest_data.name not in temp_routine_job_info_map:
                temp_routine_job_info_map[
                    current_routine_dest_data.name
                ] = RoutineJobInfo(routine_dest_id=current_routine_dest_data.destId)

            for child in current_routine_dest_data.children:
                self._stash_item(
                    current_routine_dest_data, child, items, temp_routine_job_info_map
                )
        elif current_routine_dest_data.type == DestType.UNIT:
            if parent_routine_dest_data is None:
                raise Exception(f"parent is None for {current_routine_dest_data.name}")

            nodeid = (
                f"{parent_routine_dest_data.name}::{current_routine_dest_data.name}"
            )
            item = find_item(items, nodeid)
            if item is None:
                raise Exception(f"item is not found for {nodeid}")

            self._item_map_for_routine[nodeid] = item

            routine_unit_info = RoutineUnitInfo(
                routine_dest_id=current_routine_dest_data.destId
            )
            item.stash[routine_unit_info_key] = routine_unit_info

            routine_job_info = temp_routine_job_info_map[parent_routine_dest_data.name]
            routine_job_info.children.append(routine_unit_info)
            item.stash[routine_job_info_key] = routine_job_info
        else:
            raise Exception(
                f"unknown routine dest type {current_routine_dest_data.type}"
            )


class RoutineDestReporterFactory:
    def __init__(self, dogu_config: DoguConfig):
        self.dogu_config = dogu_config

    def create(self) -> PyTestHandler:
        if self.dogu_config.step_id is None:
            print("[dogu] step id is not set. skip routine dest reporting")
            return NullDestReporter()

        if self.dogu_config.device_id is None:
            print("[dogu] device id is not set. skip routine dest reporting")
            return NullDestReporter()

        if self.dogu_config.host_token is None:
            print("[dogu] host token is not set. skip routine dest reporting")
            return NullDestReporter()

        options = RoutineDestOptions(
            api_base_url=self.dogu_config.api_base_url,
            organization_id=self.dogu_config.organization_id,
            device_id=self.dogu_config.device_id,
            step_id=self.dogu_config.step_id,
            host_token=self.dogu_config.host_token,
        )
        return RoutineDestReporter(options)
