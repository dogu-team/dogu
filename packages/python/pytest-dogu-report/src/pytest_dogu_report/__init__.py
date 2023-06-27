from pytest import Config

from .protocols import StepOptionsFactory
from .step_reporter import StepReporterFactory, StepReporter


def pytest_configure(config: Config):
    step_options = StepOptionsFactory().create()
    step_reporter = StepReporterFactory(step_options).create()
    config.pluginmanager.register(step_reporter, StepReporter.name)


def pytest_unconfigure(config: Config):
    step_reporter = config.pluginmanager.get_plugin(StepReporter.name)
    if step_reporter:
        config.pluginmanager.unregister(step_reporter)
