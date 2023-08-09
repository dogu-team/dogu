import { INestApplicationContext } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

export class CustomWsAdapter extends WsAdapter {
  constructor(app: INestApplicationContext) {
    super(app);
  }

  override create(
    port: number,
    options?: Record<string, any> & {
      namespace?: string;
      server?: any;
      path?: string;
    },
  ): any {
    if (options?.path) {
      options.path = this.updatePath(options.path);
    }
    return super.create(port, options);
  }

  private updatePath(path: string): string {
    return path;
  }
}
