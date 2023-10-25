export enum LiveSessionState {
  CREATED = 'CREATED',
  CLOSE_WAIT = 'CLOSE_WAIT',
  CLOSED = 'CLOSED',
}

export const LiveSessionActiveStates = [LiveSessionState.CREATED, LiveSessionState.CLOSE_WAIT] as const;

export type LiveSessionId = string;

export const LiveSessionWsMessageType = [LiveSessionState.CREATED, LiveSessionState.CLOSE_WAIT, LiveSessionState.CLOSED, 'remaining-free-seconds'] as const;
export type LiveSessionWsMessageType = (typeof LiveSessionWsMessageType)[number];

export interface LiveSessionWsMessage {
  type: LiveSessionWsMessageType;
  message: string;
}
