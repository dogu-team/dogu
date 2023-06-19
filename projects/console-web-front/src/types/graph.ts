import React from 'react';

export interface RuntimeInfoGraphBaseProps<D> {
  data: D[];
  durationTicks?: number[];
  durationTicksFormatter?: (value: number) => string;
  empty?: React.ReactNode;
}
