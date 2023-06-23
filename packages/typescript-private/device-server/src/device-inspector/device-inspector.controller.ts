import { Serial } from '@dogu-private/types';
import { errorify, Instance } from '@dogu-tech/common';
import { DeviceInspector, GetHitPointQuery, SwitchContextRequest, TryConnectGamiumInspectorRequest } from '@dogu-tech/device-client-common';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { deviceNotFoundError } from '../device/device.utils';
import { DoguLogger } from '../logger/logger';
import { appiumChannelNotFoundError, gamiumContextNotFoundError } from '../response-utils';
import { ScanService } from '../scan/scan.service';

@Controller(DeviceInspector.controller)
export class DeviceInspectorController {
  constructor(private readonly scanService: ScanService, private readonly logger: DoguLogger) {}

  @Get(DeviceInspector.getPageSource.path)
  async getPageSource(@Param('serial') serial: Serial): Promise<Instance<typeof DeviceInspector.getPageSource.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const appiumChannel = await channel.getAppiumChannel('inspector');
    if (!appiumChannel) {
      return appiumChannelNotFoundError(serial, 'inspector');
    }
    const pageSource = await appiumChannel.getPageSource();
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
  async getContexts(@Param('serial') serial: Serial): Promise<Instance<typeof DeviceInspector.getContexts.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const appiumChannel = await channel.getAppiumChannel('inspector');
    if (!appiumChannel) {
      return appiumChannelNotFoundError(serial, 'inspector');
    }
    const contexts = await appiumChannel.getContexts();
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
  async getContext(@Param('serial') serial: Serial): Promise<Instance<typeof DeviceInspector.getContext.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const appiumChannel = await channel.getAppiumChannel('inspector');
    if (!appiumChannel) {
      return appiumChannelNotFoundError(serial, 'inspector');
    }
    const context = await appiumChannel.getContext();
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
  async switchContext(@Param('serial') serial: Serial, @Body() body: SwitchContextRequest): Promise<Instance<typeof DeviceInspector.switchContext.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const appiumChannel = await channel.getAppiumChannel('inspector');
    if (!appiumChannel) {
      return appiumChannelNotFoundError(serial, 'inspector');
    }
    const { context } = body;
    await appiumChannel.switchContext(context);
    return {
      value: {
        $case: 'data',
        data: {},
      },
    };
  }

  @Post(DeviceInspector.switchContextAndGetPageSource.path)
  async switchContextAndGetPageSource(
    @Param('serial') serial: Serial,
    @Body() body: SwitchContextRequest,
  ): Promise<Instance<typeof DeviceInspector.switchContextAndGetPageSource.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const appiumChannel = await channel.getAppiumChannel('inspector');
    if (!appiumChannel) {
      return appiumChannelNotFoundError(serial, 'inspector');
    }
    const { context } = body;
    const pageSource = await appiumChannel.switchContextAndGetPageSource(context);
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
  async getContextPageSources(@Param('serial') serial: Serial): Promise<Instance<typeof DeviceInspector.getContextPageSources.responseBody>> {
    const channel = this.scanService.findChannel(serial);
    if (!channel) {
      return deviceNotFoundError(serial);
    }
    const { gamiumContext } = channel;
    const appiumChannel = await channel.getAppiumChannel('inspector');
    if (!appiumChannel) {
      return appiumChannelNotFoundError(serial, 'inspector');
    }
    const contextPageSources = await appiumChannel.getContextPageSources();
    if (gamiumContext) {
      if (gamiumContext.connected) {
        try {
          const gamiumContextPageSource = await gamiumContext.getContextPageSource();
          const mergedGamiumContextPageSource = {
            ...gamiumContextPageSource,
            screenSize: await appiumChannel.getScreenSize(),
            android: await appiumChannel.getAndroid(),
          };
          contextPageSources.push(mergedGamiumContextPageSource);
        } catch (error) {
          this.logger.error('Failed to get gamium context page source', { error: errorify(error) });
        }
      }
    }
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
        await gamiumContext.reconnect();
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
