import { DefaultHttpOptions, Instance, Printable, PromiseOrValue, transformAndValidate } from '@dogu-tech/common';
import { DestData, DestInfo, PublicDest } from '@dogu-tech/console-dest';
import { createConsoleApiAuthHeader, DEST_TYPE } from '@dogu-tech/types';
import axios from 'axios';
import { Job, JobChild } from '../cycle/unit/job';
import { Unit } from '../cycle/unit/unit';
import { FilledReportOptions } from './options';
import { ConsoleReporterUnit } from './unit';

export interface Reporter {
  create(rootJobs: Job[]): PromiseOrValue<void>;
}

export class NullReporter implements Reporter {
  create(rootJobs: Job[]): void {
    // noop
  }
}

export class ConsoleReporter implements Reporter {
  constructor(private readonly options: FilledReportOptions, private readonly printable: Printable) {}

  async create(rootJobs: Job[]): Promise<void> {
    const { printable } = this;
    try {
      const { DOGU_ORGANIZATION_ID, DOGU_DEVICE_ID, DOGU_STEP_ID, DOGU_API_BASE_URL, DOGU_HOST_TOKEN } = this.options;
      const requestBody: Instance<typeof PublicDest.createDest.requestBody> = {
        stepId: Number(DOGU_STEP_ID),
        destInfos: rootJobs.map((job) => this.createDestInfo(job)),
      };
      const pathProvider = new PublicDest.createDest.pathProvider(DOGU_ORGANIZATION_ID, DOGU_DEVICE_ID);
      const path = PublicDest.createDest.resolvePath(pathProvider);
      const url = `${DOGU_API_BASE_URL}${path}`;
      printable.debug?.('dest create', { url, requestBody });
      const response = await axios.post<typeof PublicDest.createDest.responseBody>(url, requestBody, {
        ...createConsoleApiAuthHeader(DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      });
      const { data } = response;
      printable.debug?.('dest created', { data });
      const validated = await transformAndValidate(PublicDest.createDest.responseBody, data);
      printable.debug?.('dest validated', { validated });
      const { dests } = validated;
      this.updateJobChildReporter(rootJobs, dests);
    } catch (error) {
      printable.verbose?.('Failed to create dest', { error });
    }
  }

  private createDestInfo(jobChild: JobChild): DestInfo {
    if (jobChild instanceof Job) {
      const { name, children } = jobChild;
      return {
        name,
        type: DEST_TYPE.JOB,
        children: children.map((child) => this.createDestInfo(child)),
      };
    } else if (jobChild instanceof Unit) {
      const { name } = jobChild;
      return {
        name,
        type: DEST_TYPE.UNIT,
        children: [],
      };
    }
    throw new Error('Unexpected job type');
  }

  private updateJobChildReporter(jobChilds: JobChild[], destDatas: DestData[]): void {
    const { DOGU_ORGANIZATION_ID, DOGU_DEVICE_ID, DOGU_API_BASE_URL, DOGU_HOST_TOKEN } = this.options;
    const { printable } = this;
    if (jobChilds.length !== destDatas.length) {
      throw new Error(`dest data length mismatch: ${jobChilds.length} !== ${destDatas.length}`);
    }
    for (let i = 0; i < jobChilds.length; i++) {
      const jobChild = jobChilds[i];
      const destData = destDatas[i];
      const { destId } = destData;
      jobChild.reporterUnit = new ConsoleReporterUnit(this, printable, DOGU_API_BASE_URL, DOGU_ORGANIZATION_ID, DOGU_DEVICE_ID, destId, DOGU_HOST_TOKEN);
      if (jobChild instanceof Job) {
        this.updateJobChildReporter(jobChild.children, destData.children);
      } else if (jobChild instanceof Unit) {
        // noop
      } else {
        throw new Error('Unexpected job type');
      }
    }
  }
}
