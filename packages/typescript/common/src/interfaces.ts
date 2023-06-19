/**
 * @deprecated Use `SyncClosable` or `AsyncClosable` instead.
 */
export interface Closable {
  close(): void;
}

export interface SyncClosable {
  close(): void;
}

export interface AsyncClosable {
  close(): Promise<void>;
}
