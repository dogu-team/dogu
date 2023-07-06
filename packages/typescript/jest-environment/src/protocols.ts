import { patch, post } from 'axios';
import { plainToInstance, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString, ValidateNested, validateOrReject } from 'class-validator';

const defaultTimeout = 60 * 1000; // unit: milliseconds

export enum DestType {
  JOB = 0,
  UNIT = 1,
}

export enum DestState {
  UNSPECIFIED = 0,
  PENDING = 1,
  RUNNING = 2,
  FAILED = 3,
  PASSED = 4,
  SKIPPED = 5,
}

const destCompletedStates = [DestState.FAILED, DestState.PASSED, DestState.SKIPPED];

export function isDestStateCompleted(state: DestState): boolean {
  return destCompletedStates.includes(state);
}

export interface DestInfo {
  name: string;
  type: DestType;
  children: DestInfo[];
}

interface UpdateDestStatusRequestBody {
  destStatus: DestState;
  localTimeStamp: string;
}

interface CreateDestRequestBody {
  stepId: number;
  destInfos: DestInfo[];
}

export class DestData {
  @IsNumber()
  @Type(() => Number)
  destId!: number;

  @IsNumber()
  @Type(() => Number)
  routineStepId!: number;

  @IsString()
  name!: string;

  @IsNumber()
  @Type(() => Number)
  index!: number;

  @IsEnum(DestState)
  state!: DestState;

  @IsEnum(DestType)
  type!: DestType;

  @ValidateNested({ each: true })
  @Type(() => DestData)
  @IsArray()
  children!: DestData[];
}

export class CreateDestResponse {
  @ValidateNested({ each: true })
  @Type(() => DestData)
  @IsArray()
  dests!: DestData[];
}

export interface StepOptions {
  apiBaseUrl: string;
  organizationId: string;
  deviceId: string;
  stepId: string;
  hostToken: string;
}

export class StepOptionsFactory {
  create(): StepOptions {
    const stepOptions: StepOptions = {
      apiBaseUrl: process.env.DOGU_API_BASE_URL ?? '',
      organizationId: process.env.DOGU_ORGANIZATION_ID ?? '',
      deviceId: process.env.DOGU_DEVICE_ID ?? '',
      stepId: process.env.DOGU_STEP_ID ?? '',
      hostToken: process.env.DOGU_HOST_TOKEN ?? '',
    };
    return stepOptions;
  }
}

export class StepReportClient {
  constructor(readonly stepOptions: StepOptions) {}

  async createDest(destInfos: DestInfo[]): Promise<DestData[]> {
    const { apiBaseUrl, organizationId, deviceId, stepId } = this.stepOptions;
    const url = `${apiBaseUrl}/public/organizations/${organizationId}/devices/${deviceId}/dests`;
    const headers = this.createHeaders();
    const requestBody: CreateDestRequestBody = {
      stepId: Number(stepId),
      destInfos,
    };
    const response = await post(url, requestBody, { headers, timeout: defaultTimeout });
    const responseBody = plainToInstance(CreateDestResponse, response.data, {
      enableCircularCheck: true,
    });
    await validateOrReject(responseBody);
    return responseBody.dests;
  }

  async updateDestStatus(destId: number, destStatus: DestState, localTimeStamp: string): Promise<void> {
    const { apiBaseUrl, organizationId, deviceId } = this.stepOptions;
    const url = `${apiBaseUrl}/public/organizations/${organizationId}/devices/${deviceId}/dests/${destId}/status`;
    const headers = this.createHeaders();
    const requestBody: UpdateDestStatusRequestBody = {
      destStatus,
      localTimeStamp,
    };
    await patch(url, requestBody, { headers, timeout: defaultTimeout });
  }

  private createHeaders(): Record<string, string> {
    const { hostToken } = this.stepOptions;
    return {
      Authorization: `Bearer ${hostToken}`,
    };
  }
}
