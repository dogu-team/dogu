from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from abc import ABC

from pytest import Config, Item, Session, TestReport, hookimpl, StashKey

from .protocols import (
    DestData,
    DestInfo,
    DestState,
    DestType,
    StepOptions,
    StepReportClient,
)


PyTestLocation = Tuple[str, Optional[int], str]


@dataclass
class UnitInfo:
    dest_id: str
    status: DestState = DestState.PENDING
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None


unit_info_key = StashKey()


@dataclass
class JobInfo:
    dest_id: str
    status: DestState = DestState.PENDING
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    children: List[UnitInfo] = field(default_factory=list)


job_info_key = StashKey()


@dataclass
class ParseNodeidResult:
    job_name: str
    unit_name: str


def _parse_nodeid(nodeid: str) -> ParseNodeidResult:
    parsed_id = nodeid.split("::")
    if len(parsed_id) != 2:
        raise Exception(f"nodeid {nodeid} is invalid")
    return ParseNodeidResult(job_name=parsed_id[0], unit_name=parsed_id[1])


def _get_job_info(item: Item) -> JobInfo:
    if job_info_key not in item.stash:
        raise Exception(f"job_info is not found in {item.nodeid}")
    job_info = item.stash[job_info_key]
    if job_info is None:
        raise Exception(f"job_info is not found in {item.nodeid}")
    return job_info


def _get_unit_info(item: Item) -> UnitInfo:
    if unit_info_key not in item.stash:
        raise Exception(f"unit_info is not found in {item.nodeid}")
    unit_info = item.stash[unit_info_key]
    if unit_info is None:
        raise Exception(f"unit_info is not found in {item.nodeid}")
    return unit_info


def _find_item(items: List[Item], nodeid: str) -> Optional[Item]:
    for item in items:
        if item.nodeid == nodeid:
            return item
    return None


class StepReporter(ABC):
    name = "dogu_step_reporter"


class NullStepReporter(StepReporter):
    pass


class StepReporterImpl(StepReporter):
    def __init__(self, options: StepOptions):
        self._client = StepReportClient(options)
        self._item_map: Dict[str, Item] = {}

    @hookimpl(trylast=True)
    def pytest_collection_modifyitems(
        self, session: Session, config: Config, items: List[Item]
    ) -> None:
        try:
            self._on_pytest_collection_modifyitems(session, config, items)
        except Exception as e:
            print(f"[dogu] failed on pytest_collection_modifyitems: {e}")

    def _on_pytest_collection_modifyitems(
        self, session: Session, config: Config, items: List[Item]
    ) -> None:
        dest_infos = self._create_dest_infos(items)
        dest_datas = self._client.create_dest(dest_infos)
        self._stash_items(items, dest_datas)

    @hookimpl(trylast=True)
    def pytest_runtest_logstart(self, nodeid: str, location: PyTestLocation) -> None:
        try:
            self._on_pytest_runtest_logstart(nodeid, location)
        except Exception as e:
            print(f"[dogu] failed on pytest_runtest_logstart: {e}")

    def _on_pytest_runtest_logstart(
        self, nodeid: str, location: PyTestLocation
    ) -> None:
        item = self._item_map.get(nodeid)
        if item is None:
            raise Exception(f"nodeid {nodeid} is not found")
        job_info = _get_job_info(item)
        if job_info.status == DestState.PENDING:
            job_info.started_at = datetime.now()
            job_info.status = DestState.RUNNING
            self._client.update_dest_status(
                job_info.dest_id, job_info.status, job_info.started_at
            )

        unit_info = _get_unit_info(item)
        unit_info.started_at = datetime.now()
        unit_info.status = DestState.RUNNING
        self._client.update_dest_status(
            unit_info.dest_id, unit_info.status, unit_info.started_at
        )

    @hookimpl(trylast=True)
    def pytest_runtest_logfinish(self, nodeid: str, location: PyTestLocation) -> None:
        try:
            self._on_pytest_runtest_logfinish(nodeid, location)
        except Exception as e:
            print(f"[dogu] failed on pytest_runtest_logfinish: {e}")

    def _on_pytest_runtest_logfinish(
        self, nodeid: str, location: PyTestLocation
    ) -> None:
        item = self._item_map.get(nodeid)
        if item is None:
            raise Exception(f"nodeid {nodeid} is not found")
        unit_info = _get_unit_info(item)
        self._client.update_dest_status(
            unit_info.dest_id, unit_info.status, unit_info.finished_at
        )

        job_info = _get_job_info(item)
        if all(child.status.is_completed() for child in job_info.children):
            self._client.update_dest_status(
                job_info.dest_id, job_info.status, job_info.finished_at
            )

    @hookimpl(trylast=True)
    def pytest_runtest_logreport(self, report: TestReport) -> None:
        try:
            self._on_pytest_runtest_logreport(report)
        except Exception as e:
            print(f"[dogu] failed on pytest_runtest_logreport: {e}")

    def _on_pytest_runtest_logreport(self, report: TestReport) -> None:
        if report.when != "call":
            return
        item = self._item_map.get(report.nodeid)
        if item is None:
            raise Exception(f"nodeid {report.nodeid} is not found")
        unit_info = _get_unit_info(item)
        unit_info.finished_at = datetime.now()
        if report.passed:
            unit_info.status = DestState.PASSED
        elif report.failed:
            unit_info.status = DestState.FAILED
        elif report.skipped:
            unit_info.status = DestState.SKIPPED
        else:
            raise Exception(f"unknown report status {report.outcome}")

        job_info = _get_job_info(item)
        if all(child.status.is_completed() for child in job_info.children):
            job_info.finished_at = datetime.now()
            if all(child.status == DestState.PASSED for child in job_info.children):
                job_info.status = DestState.PASSED
            elif any(child.status == DestState.FAILED for child in job_info.children):
                job_info.status = DestState.FAILED
            elif any(child.status == DestState.SKIPPED for child in job_info.children):
                job_info.status = DestState.SKIPPED
            else:
                raise Exception(f"unknown job status {job_info.status}")

    def _create_dest_infos(self, items: List[Item]) -> List[DestInfo]:
        temp_dest_info_map: Dict[str, DestInfo] = {}
        for item in items:
            parse_result = _parse_nodeid(item.nodeid)
            job_name = parse_result.job_name
            if job_name not in temp_dest_info_map:
                temp_dest_info_map[job_name] = DestInfo(
                    name=job_name, type=DestType.JOB
                )
            job_dest_info = temp_dest_info_map[job_name]

            unit_dest_info = DestInfo(name=item.name, type=DestType.UNIT)
            job_dest_info.children.append(unit_dest_info)
        return list(temp_dest_info_map.values())

    def _stash_items(self, items: List[Item], dest_datas: List[DestData]) -> None:
        temp_job_info_map: Dict[str, JobInfo] = {}
        for dest_data in dest_datas:
            self._stash_item(None, dest_data, items, temp_job_info_map)

    def _stash_item(
        self,
        parent: Optional[DestData],
        current: DestData,
        items: List[Item],
        temp_job_info_map: Dict[str, JobInfo],
    ) -> None:
        if current.type == DestType.JOB:
            if parent is not None:
                raise Exception(f"parent is not None for {current.name}")

            if current.name not in temp_job_info_map:
                temp_job_info_map[current.name] = JobInfo(dest_id=current.destId)

            for child in current.children:
                self._stash_item(current, child, items, temp_job_info_map)
        elif current.type == DestType.UNIT:
            if parent is None:
                raise Exception(f"parent is None for {current.name}")

            nodeid = f"{parent.name}::{current.name}"
            item = _find_item(items, nodeid)
            if item is None:
                raise Exception(f"item is not found for {nodeid}")

            self._item_map[nodeid] = item

            unit_info = UnitInfo(dest_id=current.destId)
            item.stash[unit_info_key] = unit_info

            job_info = temp_job_info_map[parent.name]
            job_info.children.append(unit_info)
            item.stash[job_info_key] = job_info
        else:
            raise Exception(f"unknown dest type {current.type}")


class StepReporterFactory:
    def __init__(self, options: StepOptions):
        self.options = options

    def create(self) -> StepReporter:
        if self.options.api_base_url == "":
            print("[dogu] api base url is not specified. step reporter is disabled.")
            return NullStepReporter()
        return StepReporterImpl(self.options)
