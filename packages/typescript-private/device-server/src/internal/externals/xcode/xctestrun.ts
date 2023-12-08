import fs from 'fs';
import plist from 'plist';

export class Xctestrun {
  private constructor(readonly filePath: string) {}

  static create(filePath: string): Promise<Xctestrun> {
    return Promise.resolve(new Xctestrun(filePath));
  }

  async updateIdaXctestrunFile(webDriverPort: number, grpcPort: number): Promise<void> {
    const content = await fs.promises.readFile(this.filePath, 'utf8');
    const value = plist.parse(content);
    if (typeof value === 'object') {
      const object = value as Record<string, unknown>;
      if ('DoguRunner' in object) {
        const runner = Reflect.get(object, 'DoguRunner') as Record<string, unknown>;
        if ('EnvironmentVariables' in runner) {
          const environment = Reflect.get(runner, 'EnvironmentVariables') as Record<string, string>;
          environment.DOGU_IOS_DEVICE_AGENT_WEB_DRIVER_PORT = `${webDriverPort}`;
          environment.DOGU_IOS_DEVICE_AGENT_GRPC_PORT = `${grpcPort}`;
          await fs.promises.writeFile(this.filePath, plist.build(value));
          return;
        }
      }
    }
    throw new Error(`xctestrun file is invalid. ${this.filePath}`);
  }
}
