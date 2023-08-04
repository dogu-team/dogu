from pytest import Config, FixtureRequest, PytestPluginManager, fixture

from .dogu_sdk import DoguSdk
from .dogu_config import DoguConfig
from .common import DoguClient
from . import dogu_hooks


def pytest_configure(config: Config):
    dogu_sdk = DoguSdk(config)
    config.pluginmanager.register(dogu_sdk, DoguSdk.name)


def pytest_unconfigure(config: Config):
    dogu_sdk = config.pluginmanager.get_plugin(DoguSdk.name)
    if dogu_sdk:
        if isinstance(dogu_sdk, DoguSdk):
            dogu_sdk.on_teardown()
        config.pluginmanager.unregister(dogu_sdk)


def pytest_addhooks(pluginmanager: PytestPluginManager):
    pluginmanager.add_hookspecs(dogu_hooks)


@fixture(scope="session")
def dogu_client(request: FixtureRequest) -> DoguClient:
    dogu_sdk = request.config.pluginmanager.get_plugin(DoguSdk.name)
    if dogu_sdk is None:
        raise Exception(
            "pytest_dogu_sdk is not registered. Please check your pytest configuration"
        )

    if not isinstance(dogu_sdk, DoguSdk):
        raise Exception("dogu_sdk is not an instance of DoguSdk")

    return dogu_sdk.client


@fixture(scope="session")
def dogu_config(request: FixtureRequest) -> DoguConfig:
    dogu_sdk = request.config.pluginmanager.get_plugin(DoguSdk.name)
    if dogu_sdk is None:
        raise Exception(
            "pytest_dogu_sdk is not registered. Please check your pytest configuration"
        )

    if not isinstance(dogu_sdk, DoguSdk):
        raise Exception("dogu_sdk is not an instance of DoguSdk")

    return dogu_sdk.config
