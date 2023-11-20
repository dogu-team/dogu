from typing import List, Optional
from pytest import Config, Item, Session, TestReport, hookimpl

from .remote_dest_reporter import RemoteDestReporterFactory
from .routine_dest_reporter import RoutineDestReporterFactory
from .dogu_config import DoguConfigFactory
from .common import PyTestHandler, PyTestLocation, DoguClient


class DoguSdk:
    name = "dogu_sdk"

    def __init__(self, pytest_config: Config) -> None:
        self._pytest_config = pytest_config
        self.config = DoguConfigFactory().create()

        routine_dest_reporter = RoutineDestReporterFactory(self.config).create()
        self._handlers: List[PyTestHandler] = [routine_dest_reporter]

        self.client = None
        if self._pytest_config.hook.pytest_dogu_create_client:
            result = self._pytest_config.hook.pytest_dogu_create_client()
            if result:
                (client, _) = result
                self.client: Optional[DoguClient] = client
                client_impl = self.client.on_setup(self.config)
                if not client_impl:
                    raise Exception("dogu client is not initialized on setup")
                self.client.impl = client_impl        
                remote_dest_reporter = RemoteDestReporterFactory(
                    self.config,
                    self.client,
                ).create()
                self._handlers.append(remote_dest_reporter)

    def on_teardown(self) -> None:
        if self.client:
            try:
                self.client.on_teardown()
            except Exception as exception:
                print(f"[dogu] failed on dogu client.on_teardown: {exception}")

    @hookimpl(trylast=True)
    def pytest_collection_modifyitems(
        self, session: Session, config: Config, items: List[Item]
    ) -> None:
        for handler in self._handlers:
            try:
                handler.on_pytest_collection_modifyitems(session, config, items)
            except Exception as exception:
                print(f"[dogu] failed on pytest_collection_modifyitems: {exception}")

    @hookimpl(trylast=True)
    def pytest_runtest_logstart(self, nodeid: str, location: PyTestLocation) -> None:
        for handler in self._handlers:
            try:
                handler.on_pytest_runtest_logstart(nodeid, location)
            except Exception as exception:
                print(f"[dogu] failed on pytest_runtest_logstart: {exception}")

    @hookimpl(trylast=True)
    def pytest_runtest_logfinish(self, nodeid: str, location: PyTestLocation) -> None:
        for handler in self._handlers:
            try:
                handler.on_pytest_runtest_logfinish(nodeid, location)
            except Exception as exception:
                print(f"[dogu] failed on pytest_runtest_logfinish: {exception}")

    @hookimpl(trylast=True)
    def pytest_runtest_logreport(self, report: TestReport) -> None:
        for handler in self._handlers:
            try:
                handler.on_pytest_runtest_logreport(report)
            except Exception as exception:
                print(f"[dogu] failed on pytest_runtest_logreport: {exception}")
