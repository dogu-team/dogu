import { DestBubbleableState, DestPropagatableState } from '@dogu-tech/types';

export interface OnStateChangeable {
  onStatePropagated(state: DestPropagatableState): Promise<void>;
  onStateBubbled(state: DestBubbleableState): Promise<void>;
  isStateCompleted(): boolean;
}

export interface Cloneable {
  clone(): this;
}
