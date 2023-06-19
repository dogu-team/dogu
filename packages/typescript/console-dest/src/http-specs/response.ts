import { DestId, DestPublic, DEST_STATE, DEST_TYPE, RoutineStepId } from '@dogu-tech/types';

export class CreateDestResponse {
  dests!: DestData[];
}

export class DestData implements Pick<DestPublic, 'destId' | 'routineStepId' | 'name' | 'index' | 'state' | 'type'> {
  destId!: DestId;
  routineStepId!: RoutineStepId;
  name!: string;
  index!: number;
  state!: DEST_STATE;
  type!: DEST_TYPE;
  children!: DestData[];
}
