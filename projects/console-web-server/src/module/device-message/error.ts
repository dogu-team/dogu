export class WebsocketCloseError extends Error {
  constructor(public readonly code: number, public readonly reason: string) {
    super(`${code}. ${reason}`);
  }
}
