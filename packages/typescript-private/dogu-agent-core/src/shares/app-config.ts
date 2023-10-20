export const AppConfigSchema = {
  NODE_ENV: {
    type: 'string',
  },
  DOGU_RUN_TYPE: {
    type: 'string',
  },
  DOGU_LOG_LEVEL: {
    type: 'string',
  },
  DOGU_HOST_TOKEN: {
    type: 'string',
  },
  DOGU_API_BASE_URL: {
    type: 'string',
  },
  DOGU_DEVICE_SERVER_HOST_PORT: {
    type: 'string',
  },
  DOGU_DEVICE_SERVER_PORT: {
    type: 'number',
  },
  DOGU_IS_SUPPORTED_PLATFORM_VALID: {
    type: 'boolean',
  },
  DOGU_HOST_AGENT_PORT: {
    type: 'number',
  },
  DOGU_AGENT_VERSION: {
    type: 'string',
  },
  DOGU_DEVICE_PLATFORM_ENABLED: {
    type: 'string',
  },
  DOGU_DEVICE_IOS_RESTART_ON_INIT: {
    type: 'boolean',
  },
  DOGU_LINUX_DEVICE_SERIAL: {
    type: 'string',
  },
  DOGU_IS_DEVICE_SHARE: {
    type: 'boolean',
  },
  DOGU_WIFI_SSID: {
    type: 'string',
  },
  DOGU_WIFI_PASSWORD: {
    type: 'string',
  },
  is_show_devui: {
    type: 'boolean',
  },
  external_is_agreed_jdk: {
    type: 'boolean',
  },
  external_is_agreed_android_sdk: {
    type: 'boolean',
  },
  external_is_agreed_appium: {
    type: 'boolean',
  },
  external_is_agreed_libimobiledevice: {
    type: 'boolean',
  },
  external_is_agreed_gecko_driver: {
    type: 'boolean',
  },
  external_is_agreed_selenium_server: {
    type: 'boolean',
  },
  external_is_agreed_selenium_webdriver: {
    type: 'boolean',
  },
} as const;

export type AppConfigSchema = typeof AppConfigSchema;
export type AppConfigKey = keyof AppConfigSchema;
