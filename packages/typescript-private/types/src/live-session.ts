export enum LiveSessionState {
  CREATED = 'CREATED',
  CLOSE_WAIT = 'CLOSE_WAIT',
  CLOSED = 'CLOSED',
}

export type LiveSessionId = string;

export interface LiveSessionWsMessage {
  type: LiveSessionState;
  message: string;
}
