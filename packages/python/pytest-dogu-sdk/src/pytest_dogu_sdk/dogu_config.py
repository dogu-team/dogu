from typing import List, Optional, Union
import os

from pyjson5 import decode_io  # pylint: disable=no-name-in-module
from jsonschema import validate


_config_dir_path = os.path.dirname(os.path.realpath(__file__))
_schema_file_path = os.path.join(_config_dir_path, "dogu.config.schema.json")
_config_file_path = os.path.join(os.getcwd(), "dogu.config.json")


def _load_config_file_schema() -> dict:
    with open(_schema_file_path, "r", encoding="utf8") as file:
        return decode_io(file)


def _load_config_file() -> dict:
    with open(_config_file_path, "r", encoding="utf8") as file:
        return decode_io(file)


def _validate_config_file(config: dict, schema: dict) -> None:
    validate(instance=config, schema=schema)


def _load_and_validate_config_file() -> dict:
    schema = _load_config_file_schema()
    config = _load_config_file()
    _validate_config_file(config, schema)
    return config


def _is_config_file_exist() -> bool:
    return os.path.exists(_config_file_path)


class DoguConfig:
    def __init__(self, config: dict):
        self._config = config

    @property
    def version(self) -> int:
        return self._config["version"]

    @property
    def api_base_url(self) -> str:
        api_base_url = os.environ.get("DOGU_API_BASE_URL", self._config.get("apiBaseUrl", ""))
        if api_base_url.endswith("/"):
            return api_base_url[:-1]
        return api_base_url

    @property
    def organization_id(self) -> str:
        return os.environ.get("DOGU_ORGANIZATION_ID", self._config.get("organizationId", ""))

    @property
    def project_id(self) -> str:
        return os.environ.get("DOGU_PROJECT_ID", self._config.get("projectId", ""))

    @property
    def token(self) -> str:
        return os.environ.get("DOGU_TOKEN", self._config["token"])

    @property
    def runs_on(self) -> Union[str, List[str]]:
        return os.environ.get("DOGU_RUNS_ON", self._config["runsOn"])

    @property
    def browser_name(self) -> Optional[str]:
        return os.environ.get("DOGU_BROWSER_NAME", self._config.get("browserName"))

    @property
    def browser_version(self) -> Optional[str]:
        return os.environ.get(
            "DOGU_BROWSER_VERSION", self._config.get("browserVersion")
        )

    @property
    def app_version(self) -> Optional[str]:
        return os.environ.get("DOGU_APP_VERSION", self._config.get("appVersion"))

    @property
    def device_id(self) -> Optional[str]:
        return os.environ.get("DOGU_DEVICE_ID")

    @property
    def step_id(self) -> Optional[str]:
        return os.environ.get("DOGU_STEP_ID")

    @property
    def host_token(self) -> Optional[str]:
        return os.environ.get("DOGU_HOST_TOKEN")

    @property
    def fail_fast(self) -> bool:
        return self._config.get("failFast", False)


class DoguConfigFactory:
    def create(self) -> DoguConfig:
        if _is_config_file_exist():
            config_file_dict = _load_and_validate_config_file()
            print("[dogu] dogu.config.json is loaded")
            return DoguConfig(config_file_dict)
        print("[dogu] dogu.config.json is not found. use default config")
        return DoguConfig({})
