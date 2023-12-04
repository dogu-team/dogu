import { errorify, FilledPrintable, LogLevel, PromiseOrValue } from '@dogu-tech/common';
import { DeviceClient, DeviceClients, DeviceClientsFactory, DeviceHostClient } from '@dogu-tech/device-client';
import { Logger } from '@dogu-tech/node';
import { DeviceServerToken, OrganizationId } from '@dogu-tech/types';
import { ActionConfig } from './config/config';
import { ActionInputAccessor } from './config/input-accessor';
import { ActionConfigLoader } from './config/loader';
import { ConsoleActionClient } from './console-action-client';
import { ActionLogger } from './logger.instance';
import { ActionKitOptions, fillActionKitOptions, FilledActionKitOptions } from './options';

export interface ActionContext {
  options: FilledActionKitOptions;
  logger: FilledPrintable;
  config: ActionConfig;
  input: ActionInputAccessor;
  consoleActionClient: ConsoleActionClient;
  deviceClient: DeviceClient;
  deviceHostClient: DeviceHostClient;
}

export class ActionKit {
  constructor(private readonly options?: ActionKitOptions) {}

  static withOptions(options?: ActionKitOptions): ActionKit {
    return new ActionKit(options);
  }

  static run(onRun: (context: ActionContext) => PromiseOrValue<void>): void {
    return new ActionKit().run(onRun);
  }

  run(onRun: (context: ActionContext) => PromiseOrValue<void>): void {
    (async (): Promise<void> => {
      const filledOptions = await fillActionKitOptions(this.options);
      const {
        DOGU_LOG_LEVEL,
        DOGU_LOG_TO_FILE,
        DOGU_DEVICE_SERVER_URL,
        DOGU_REQUEST_TIMEOUT,
        DOGU_API_BASE_URL,
        DOGU_ORGANIZATION_ID,
        DOGU_REPOSITORY,
        DOGU_ACTION_INPUTS,
        DOGU_HOST_TOKEN,
        DOGU_DEVICE_TOKEN,
      } = filledOptions;
      this.updateLogger(ActionLogger, DOGU_LOG_LEVEL, DOGU_LOG_TO_FILE);
      const actionConfig = await this.loadActionConfig(ActionLogger);
      const actionInputAccessor = new ActionInputAccessor(actionConfig, DOGU_ACTION_INPUTS);
      const deviceClients = this.createDeviceClients(ActionLogger, DOGU_DEVICE_SERVER_URL, DOGU_DEVICE_TOKEN, DOGU_REQUEST_TIMEOUT);
      const { deviceClient, deviceHostClient } = deviceClients;
      const consoleActionClient = this.createConsoleActionClient(ActionLogger, DOGU_API_BASE_URL, DOGU_ORGANIZATION_ID, DOGU_REPOSITORY, DOGU_HOST_TOKEN);
      await onRun({ options: filledOptions, logger: ActionLogger, config: actionConfig, input: actionInputAccessor, deviceClient, deviceHostClient, consoleActionClient });
    })().catch((e) => {
      ActionLogger.error('ActionKit.run failed', { error: errorify(e) });
      process.exit(1);
    });
  }

  private updateLogger(logger: Logger, DOGU_LOG_LEVEL: LogLevel, DOGU_LOG_TO_FILE: boolean): void {
    logger.setLogLevel(DOGU_LOG_LEVEL);
    if (DOGU_LOG_TO_FILE) {
      logger.addFileTransports();
    }
  }

  private createConsoleActionClient(
    printable: FilledPrintable,
    DOGU_API_BASE_URL: string,
    DOGU_ORGANIZATION_ID: OrganizationId,
    DOGU_REPOSITORY: string,
    DOGU_HOST_TOKEN: string,
  ): ConsoleActionClient {
    if (!DOGU_API_BASE_URL || !DOGU_ORGANIZATION_ID || !DOGU_REPOSITORY) {
      printable.error('ConsoleActionClient is not created because of missing environment variables', {
        DOGU_API_BASE_URL,
        DOGU_ORGANIZATION_ID,
        DOGU_REPOSITORY,
      });
      throw new Error('ConsoleActionClient is not created because of missing environment variables');
    }
    const client = new ConsoleActionClient(printable, DOGU_API_BASE_URL, DOGU_ORGANIZATION_ID, DOGU_HOST_TOKEN, DOGU_REPOSITORY);
    printable.verbose('ConsoleActionClient is created', {
      DOGU_API_BASE_URL,
      DOGU_ORGANIZATION_ID,
      DOGU_REPOSITORY,
    });
    return client;
  }

  private createDeviceClients(printable: FilledPrintable, DOGU_DEVICE_SERVER_URL: string, DOGU_DEVICE_TOKEN: string, DOGU_REQUEST_TIMEOUT: number): DeviceClients {
    if (!DOGU_DEVICE_SERVER_URL) {
      printable.error('DeviceClientsFactory is not created because of missing environment variables', {
        DOGU_DEVICE_SERVER_URL,
      });
      throw new Error('DeviceClientsFactory is not created because of missing environment variables');
    }
    const deviceClientsFactory = new DeviceClientsFactory({
      deviceServerUrl: DOGU_DEVICE_SERVER_URL,
      printable: ActionLogger,
      tokenGetter: (): DeviceServerToken => {
        return {
          value: DOGU_DEVICE_TOKEN,
        };
      },
      timeout: DOGU_REQUEST_TIMEOUT,
    });
    const clients = deviceClientsFactory.create();
    printable.verbose('DeviceClientsFactory is created', {
      DOGU_DEVICE_SERVER_URL,
      DOGU_REQUEST_TIMEOUT,
    });
    return clients;
  }

  private async loadActionConfig(printable: FilledPrintable): Promise<ActionConfig> {
    const config = await new ActionConfigLoader().load();
    printable.verbose('ActionConfig is loaded', {
      config,
    });
    return config;
  }
}
