from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.options import ArgOptions
from selenium.webdriver import Remote

from .dogu_config import DoguConfig


class DriverFactory:
    def __init__(self, dogu_config: DoguConfig):
        self._dogu_config = dogu_config

    def create(self) -> WebDriver:
        options = ArgOptions()
        options.set_capability(
            "dogu:options",
            {
                "organizationId": self._dogu_config.organization_id,
                "projectId": self._dogu_config.project_id,
                "token": self._dogu_config.token,
                "runsOn": self._dogu_config.runs_on,
                "browserName": self._dogu_config.browser_name,
                "browserVersion": self._dogu_config.browser_version,
                "appVersion": self._dogu_config.app_version,
            },
        )
        api_base_url = self._dogu_config.api_base_url
        driver = Remote(
            command_executor=f"{api_base_url}/remote/wd/hub", options=options
        )
        return driver
