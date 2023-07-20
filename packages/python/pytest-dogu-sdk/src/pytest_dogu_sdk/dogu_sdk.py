from typing import List
from pytest import Config, Item, Session, TestReport, hookimpl

from .driver_factory import DriverFactory
from .remote_dest_reporter import RemoteDestReporterFactory
from .routine_dest_reporter import RoutineDestReporterFactory
from .dogu_config import DoguConfigFactory
from .common import PyTestHandler, PyTestLocation


class DoguSdk:
    name = "dogu_sdk"

    def __init__(self) -> None:
        self._dogu_config = DoguConfigFactory().create()
        self.driver = DriverFactory(self._dogu_config).create()
        self._routine_dest_reporter = RoutineDestReporterFactory(
            self._dogu_config
        ).create()
        self._remote_dest_reporter = RemoteDestReporterFactory(
            self._dogu_config,
            self.driver,
        ).create()
        self._handlers: List[PyTestHandler] = [
            self._routine_dest_reporter,
            self._remote_dest_reporter,
        ]

    @hookimpl(trylast=True)
    def pytest_collection_modifyitems(
        self, session: Session, config: Config, items: List[Item]
    ) -> None:
        for handler in self._handlers:
            try:
                handler.on_pytest_collection_modifyitems(session, config, items)
            except Exception as e:
                print(f"[dogu] failed on pytest_collection_modifyitems: {e}")

    @hookimpl(trylast=True)
    def pytest_runtest_logstart(self, nodeid: str, location: PyTestLocation) -> None:
        for handler in self._handlers:
            try:
                handler.on_pytest_runtest_logstart(nodeid, location)
            except Exception as e:
                print(f"[dogu] failed on pytest_runtest_logstart: {e}")

    @hookimpl(trylast=True)
    def pytest_runtest_logfinish(self, nodeid: str, location: PyTestLocation) -> None:
        for handler in self._handlers:
            try:
                handler.on_pytest_runtest_logfinish(nodeid, location)
            except Exception as e:
                print(f"[dogu] failed on pytest_runtest_logfinish: {e}")

    @hookimpl(trylast=True)
    def pytest_runtest_logreport(self, report: TestReport) -> None:
        for handler in self._handlers:
            try:
                handler.on_pytest_runtest_logreport(report)
            except Exception as e:
                print(f"[dogu] failed on pytest_runtest_logreport: {e}")
