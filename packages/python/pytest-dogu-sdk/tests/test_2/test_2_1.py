from pytest_dogu_sdk.common import DoguClient
from pytest_dogu_sdk.dogu_config import DoguConfig
from selenium.webdriver.remote.webdriver import WebDriver


def test_1():
    pass


def test_web(dogu_client: DoguClient):
    dogu_client.cast(WebDriver).get("http://www.google.com")


def test_web2(dogu_client: DoguClient):
    dogu_client.cast(WebDriver).get("http://www.google.com")


def test_web3(dogu_client: DoguClient):
    dogu_client.cast(WebDriver).get("http://www.google.com")


def test_web4(dogu_client: DoguClient, dogu_config: DoguConfig):
    print(dogu_config.api_base_url)
    dogu_client.cast(WebDriver).get("http://www.google.com")
