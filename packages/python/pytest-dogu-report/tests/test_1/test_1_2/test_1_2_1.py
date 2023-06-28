from pytest import FixtureRequest, fixture
from pytest_dogu_report.step_reporter import StepReporter, StepReporterImpl
from typing import Optional


@fixture(scope="session")
def step_reporter(request: FixtureRequest):
    return request.config.pluginmanager.get_plugin(StepReporter.name)


def test_step_reporter(step_reporter: Optional[StepReporter]):
    assert step_reporter is not None
    assert isinstance(step_reporter, StepReporterImpl)


def test_1():
    pass


def test_2():
    pass
