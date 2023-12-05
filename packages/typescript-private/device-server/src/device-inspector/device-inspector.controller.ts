import { Serial } from '@dogu-private/types';
import { Instance } from '@dogu-tech/common';
import { DeviceInspector, GetHitPointQuery, SwitchContextRequest, TryConnectGamiumInspectorRequest } from '@dogu-tech/device-client-common';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DevicePermission } from '../auth/decorators';
import { deviceNotFoundError } from '../device/device.utils';
import { DoguLogger } from '../logger/logger';
import { appiumContextNotFoundError, gamiumContextNotFoundError } from '../response-utils';
import { ScanService } from '../scan/scan.service';

@Controller(DeviceInspector.controller)
export class DeviceInspectorController {
  constructor(
    private readonly scanService: ScanService,
    private readonly logger: DoguLogger,
  ) {}

  @Get(DeviceInspector.getPageSource.path)
  @DevicePermission({ allowAdmin: true, allowTemporary: 'serial' })
  async getPageSource(@Param('serial') serial: Serial): Promise<Instance<typeof DeviceInspector.getPageSource.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const appiumContext = await channel.getAppiumContext();
    if (!appiumContext) {
      return appiumContextNotFoundError(serial);
    }
    const pageSource = await appiumContext.getPageSource();
    return {
      value: {
        $case: 'data',
        data: {
          pageSource,
        },
      },
    };
  }

  @Get(DeviceInspector.getContexts.path)
  @DevicePermission({ allowAdmin: true, allowTemporary: 'serial' })
  async getContexts(@Param('serial') serial: Serial): Promise<Instance<typeof DeviceInspector.getContexts.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const appiumContext = await channel.getAppiumContext();
    if (!appiumContext) {
      return appiumContextNotFoundError(serial);
    }
    const contexts = await appiumContext.getContexts();
    return {
      value: {
        $case: 'data',
        data: {
          contexts,
        },
      },
    };
  }

  @Get(DeviceInspector.getContext.path)
  @DevicePermission({ allowAdmin: true, allowTemporary: 'serial' })
  async getContext(@Param('serial') serial: Serial): Promise<Instance<typeof DeviceInspector.getContext.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const appiumContext = await channel.getAppiumContext();
    if (!appiumContext) {
      return appiumContextNotFoundError(serial);
    }
    const context = await appiumContext.getContext();
    return {
      value: {
        $case: 'data',
        data: {
          context,
        },
      },
    };
  }

  @Post(DeviceInspector.switchContext.path)
  @DevicePermission({ allowAdmin: true, allowTemporary: 'serial' })
  async switchContext(@Param('serial') serial: Serial, @Body() body: SwitchContextRequest): Promise<Instance<typeof DeviceInspector.switchContext.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const appiumContext = await channel.getAppiumContext();
    if (!appiumContext) {
      return appiumContextNotFoundError(serial);
    }
    const { context } = body;
    await appiumContext.switchContext(context);
    return {
      value: {
        $case: 'data',
        data: {},
      },
    };
  }

  @Post(DeviceInspector.switchContextAndGetPageSource.path)
  @DevicePermission({ allowAdmin: true, allowTemporary: 'serial' })
  async switchContextAndGetPageSource(
    @Param('serial') serial: Serial,
    @Body() body: SwitchContextRequest,
  ): Promise<Instance<typeof DeviceInspector.switchContextAndGetPageSource.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const appiumContext = await channel.getAppiumContext();
    if (!appiumContext) {
      return appiumContextNotFoundError(serial);
    }
    const { context } = body;
    const pageSource = await appiumContext.switchContextAndGetPageSource(context);
    return {
      value: {
        $case: 'data',
        data: {
          pageSource,
        },
      },
    };
  }

  @Get(DeviceInspector.getContextPageSources.path)
  @DevicePermission({ allowAdmin: true, allowTemporary: 'serial' })
  async getContextPageSources(@Param('serial') serial: Serial): Promise<Instance<typeof DeviceInspector.getContextPageSources.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const appiumContext = await channel.getAppiumContext();
    if (!appiumContext) {
      return appiumContextNotFoundError(serial);
    }
    const contextPageSources = await appiumContext.getContextPageSources();
    return {
      value: {
        $case: 'data',
        data: {
          contextPageSources,
        },
      },
    };
  }

  @Post(DeviceInspector.tryConnectGamiumInspector.path)
  @DevicePermission({ allowAdmin: true, allowTemporary: 'serial' })
  async connectGamiumInspector(
    @Param('serial') serial: Serial,
    @Body() body: TryConnectGamiumInspectorRequest,
  ): Promise<Instance<typeof DeviceInspector.tryConnectGamiumInspector.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const { gamiumContext } = channel;
    if (!gamiumContext) {
      return gamiumContextNotFoundError(serial);
    }
    try {
      const reconnected = await gamiumContext.update({ gamiumEnginePort: body.gamiumEnginePort });
      if (reconnected) {
        return {
          value: {
            $case: 'data',
            data: {
              status: 'connected',
            },
          },
        };
      } else {
        if (!gamiumContext.connected) {
          await gamiumContext.reconnect();
        }
        return {
          value: {
            $case: 'data',
            data: {
              status: 'connected',
            },
          },
        };
      }
    } catch (error) {
      return {
        value: {
          $case: 'data',
          data: {
            status: 'notConnected',
          },
        },
      };
    }
  }

  @Get(DeviceInspector.getHitPoint.path)
  @DevicePermission({ allowAdmin: true, allowTemporary: 'serial' })
  async getHitPoint(@Param('serial') serial: Serial, @Query() getHitPointQueryDto: GetHitPointQuery): Promise<Instance<typeof DeviceInspector.getHitPoint.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }

    const { gamiumContext } = channel;
    if (!gamiumContext) {
      return gamiumContextNotFoundError(serial);
    }

    if (gamiumContext.connected) {
      try {
        const { x: screenX, y: screenY, deviceWidth, deviceHeight } = getHitPointQueryDto;
        const hitPoint = await gamiumContext.getHitPoint({ x: screenX, y: screenY }, { x: deviceWidth, y: deviceHeight });
        return {
          value: {
            $case: 'data',
            data: {
              hitPoint,
            },
          },
        };
      } catch (error) {
        return {
          value: {
            $case: 'data',
            data: {
              hitPoint: undefined,
            },
          },
        };
      }
    }

    return {
      value: {
        $case: 'data',
        data: {
          hitPoint: undefined,
        },
      },
    };
  }
}
