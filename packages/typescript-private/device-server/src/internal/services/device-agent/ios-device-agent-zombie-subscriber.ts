import { SyncClosable } from '@dogu-tech/common';

export class IosDeviceAgentZombieSubscriber implements SyncClosable {
  private closable?: SyncClosable;
  constructor(
    private option: {
      subscribe: () => SyncClosable;
      onClose: () => void;
    },
  ) {}

  subscribe(): SyncClosable {
    this.closable = this.option.subscribe();
    return this.closable;
  }

  close(): void {
    this.closable?.close();
    this.option.onClose();
  }
}
