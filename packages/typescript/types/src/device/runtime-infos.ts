import { propertiesOf } from '@dogu-tech/common';
import {
  RuntimeInfo,
  RuntimeInfoBattery,
  RuntimeInfoCpu,
  RuntimeInfoCpuFreq,
  RuntimeInfoDisplay,
  RuntimeInfoFs,
  RuntimeInfoGpu,
  RuntimeInfoMem,
  RuntimeInfoNet,
} from '../protocol/generated/tsproto/outer/profile/runtime_info';
import {
  RuntimeProcessInfo,
  RuntimeProcessInfoCpu,
  RuntimeProcessInfoFs,
  RuntimeProcessInfoMem,
  RuntimeProcessInfoNet,
} from '../protocol/generated/tsproto/outer/profile/runtime_process_info';

export const RuntimeInfoCpuProps = propertiesOf<RuntimeInfoCpu>();
export const RuntimeInfoCpuFreqProps = propertiesOf<RuntimeInfoCpuFreq>();
export const RuntimeInfoGpuProps = propertiesOf<RuntimeInfoGpu>();
export const RuntimeInfoMemProps = propertiesOf<RuntimeInfoMem>();
export const RuntimeInfoFsProps = propertiesOf<RuntimeInfoFs>();
export const RuntimeInfoNetProps = propertiesOf<RuntimeInfoNet>();
export const RuntimeInfoDisplayProps = propertiesOf<RuntimeInfoDisplay>();
export const RuntimeInfoBatteryProps = propertiesOf<RuntimeInfoBattery>();

export const RuntimeProcessInfoProps = propertiesOf<RuntimeProcessInfo>();
export const RuntimeProcessInfoCpuProps = propertiesOf<RuntimeProcessInfoCpu>();
export const RuntimeProcessInfoMemProps = propertiesOf<RuntimeProcessInfoMem>();
export const RuntimeProcessInfoFsProps = propertiesOf<RuntimeProcessInfoFs>();
export const RuntimeProcessInfoNetProps = propertiesOf<RuntimeProcessInfoNet>();

export const RuntimeInfoProps = propertiesOf<RuntimeInfo>();

export type FilledRuntimeInfo = Required<RuntimeInfo>;
