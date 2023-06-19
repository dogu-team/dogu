import { AsyncClosable, errorify, NullLogger, Printable, retry, SyncClosable } from '@dogu-tech/common';
import { DeviceHostClient, DeviceInterface } from '@dogu-tech/device-client';
import { categoryFromPlatform, PlatformType, Serial } from '@dogu-tech/types';
import { GamiumClient, NodeGamiumService } from 'gamium';
import { GameProfileReporterContext } from './game-profile-reporter/context';
import { GameProfileReporterContextFactory } from './game-profile-reporter/factory';

export class GamiumContext implements AsyncClosable {
  constructor(
    readonly client: GamiumClient,
    private readonly gamiumEngineUnforwarder: SyncClosable,
    private readonly gameProfileReporterContext: GameProfileReporterContext | null,
    private readonly printable: Printable,
  ) {}

  async close(): Promise<void> {
    await this.gameProfileReporterContext?.close().catch((error) => {
      this.printable.error('Failed to close game profile reporter context', { error: errorify(error) });
    });
    this.client.disconnect();
    this.gamiumEngineUnforwarder.close();
  }
}

export async function createGamiumContext(
  deviceClient: DeviceInterface,
  deviceHostClient: DeviceHostClient,
  gamiumEnginePort: number,
  deviceSerial: Serial,
  platform: PlatformType,
  retryCount: number,
  retryInterval: number,
  requestTimeout: number,
  reportGameProfile: boolean,
  printable: Printable,
): Promise<GamiumContext> {
  const triedHostPorts: number[] = [];
  const { gamiumClient, gamiumEngineUnforwarder } = await retry(
    async () => {
      let closer: SyncClosable = {
        close: () => {
          return;
        },
      };
      try {
        let hostPort = gamiumEnginePort;
        if (categoryFromPlatform(platform) === 'mobile') {
          hostPort = await deviceHostClient.getFreePort(triedHostPorts);
          triedHostPorts.push(hostPort);
          printable.info(`Forwarding Gamium engine port ${gamiumEnginePort} to host port ${hostPort}...`);
          closer = await deviceClient.forward(deviceSerial, hostPort, gamiumEnginePort);
          printable.info('Done.');
        }
        printable.info('Connecting Gamium client to Gamium engine...');
        const gamiumService = new NodeGamiumService('127.0.0.1', hostPort, requestTimeout, printable);
        const gamiumClient = new GamiumClient(gamiumService, printable);
        await gamiumClient.connect(retryCount);
        printable.info('Done.');
        return { gamiumClient, gamiumEngineUnforwarder: closer };
      } catch (error) {
        closer?.close();
        throw error;
      }
    },
    { retryCount, retryInterval, printable: NullLogger.instance },
  );
  const gameProfileReporterContext = reportGameProfile ? new GameProfileReporterContextFactory().create() : null;
  return new GamiumContext(gamiumClient, gamiumEngineUnforwarder, gameProfileReporterContext, printable);
}
