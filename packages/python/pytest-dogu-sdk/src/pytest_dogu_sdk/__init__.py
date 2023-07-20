from pytest import Config, FixtureRequest, fixture

from .dogu_sdk import DoguSdk


def pytest_configure(config: Config):
    dogu_sdk = DoguSdk()
    config.pluginmanager.register(dogu_sdk, DoguSdk.name)


def pytest_unconfigure(config: Config):
    dogu_sdk = config.pluginmanager.get_plugin(DoguSdk.name)
    if dogu_sdk:
        if isinstance(dogu_sdk, DoguSdk):
            dogu_sdk.driver.quit()
        config.pluginmanager.unregister(dogu_sdk)


@fixture(scope="session")
def driver(request: FixtureRequest):
    dogu_sdk = request.config.pluginmanager.get_plugin(DoguSdk.name)
    if dogu_sdk is None:
        raise Exception(
            "pytest_dogu_sdk is not registered. Please check your pytest configuration"
        )

    if not isinstance(dogu_sdk, DoguSdk):
        raise Exception("dogu_sdk is not an instance of DoguSdk")

    return dogu_sdk.driver
