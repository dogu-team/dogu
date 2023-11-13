import assert from 'assert';
import { Uint8ArrayUtil } from '..';

export class SizePrefixedRecvQueue {
  private buffer: Uint8Array;

  constructor() {
    this.buffer = new Uint8Array(0);
  }

  public pushBuffer(buffer: Uint8Array): void {
    const newBuffer = new Uint8Array(this.buffer.length + buffer.length);
    newBuffer.set(this.buffer);
    newBuffer.set(buffer, this.buffer.length);
    this.buffer = newBuffer;
  }

  public popLoop(callback: (array: Uint8Array) => void): void {
    for (let i = 0; i < 100000; i++) {
      if (!this.has()) {
        return;
      }
      const array = this.pop();
      callback(array);
    }
  }

  private has(): boolean {
    if (this.buffer.length < 4) return false;
    const packetSize = Uint8ArrayUtil.readUint32(this.buffer, 0);
    if (this.buffer.length < packetSize + 4) return false;
    return true;
  }

  private pop(): Uint8Array {
    assert(this.has(), 'PacketQueue no package to pop');

    const packetSize = Uint8ArrayUtil.readUint32(this.buffer, 0);
    const ret = this.buffer.subarray(4, 4 + packetSize);
    this.buffer = this.buffer.subarray(4 + packetSize, this.buffer.length);
    return ret;
  }

  public clear(): void {
    this.buffer = new Uint8Array(0);
  }
}
