import { OneofUnionTypes, PrivateProtocol } from '@dogu-private/types';

type DcDaParam = PrivateProtocol.DcDaParam;
type DcDaReturn = PrivateProtocol.DcDaReturn;

export type DcDaParamKeys = OneofUnionTypes.UnionValueKeys<DcDaParam>;
export type DcDaParamUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcDaParam, Key>;
export type DcDaParamUnionPickValue<Key extends keyof DcDaParamUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcDaParam, Key>;

export type DcDaReturnKeys = OneofUnionTypes.UnionValueKeys<DcDaReturn>;
export type DcDaReturnUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcDaReturn, Key>;
export type DcDaReturnUnionPickValue<Key extends keyof DcDaReturnUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcDaReturn, Key>;

export interface DeviceAgentService {
  get screenUrl(): string;
  get inputUrl(): string;

  install(): Promise<void>;
  connect(): Promise<void>;
}
