import { JobSchema, RoutineSchema } from '@dogu-private/types';
import { HttpException, HttpStatus } from '@nestjs/common';

export function validateRoutineSchema(schema: RoutineSchema): void {
  // job needs validation
  const jobNames = Object.keys(schema.jobs);
  const jobs = schema.jobs;

  // needs exist
  for (const jobName of jobNames) {
    const job = jobs[jobName];
    const needs = getNeeds(job, jobName);
    needs.map((need) => {
      if (!jobNames.includes(need)) {
        throw new HttpException(`need '${need}' of job '${jobName}' is not defined.`, HttpStatus.BAD_REQUEST);
      }
    });

    // circular dependency
    if (isCircularDependency(schema, jobName, jobName)) {
      throw new HttpException(`circular dependency of job '${jobName}'.`, HttpStatus.BAD_REQUEST);
    }
  }
}

function getNeeds(job: JobSchema, jobName: string): string[] {
  if (!job) {
    throw new HttpException(`${jobName} is not defined.`, HttpStatus.BAD_REQUEST);
  }

  if (!job.needs) {
    return [];
  }
  const needs = typeof job.needs === 'string' ? [job.needs] : Array.isArray(job.needs) ? job.needs : [];
  if (needs.length === 0) {
    throw new HttpException(`needs property of job '${jobName}' is empty.`, HttpStatus.BAD_REQUEST);
  }
  return needs;
}

function isCircularDependency(schema: RoutineSchema, jobName: string, seedJobName: string): boolean {
  const jobs = schema.jobs;
  const job = jobs[jobName];
  const needs = getNeeds(job, jobName);

  const isCircular = needs.some((need) => need === seedJobName || isCircularDependency(schema, need, seedJobName));
  return isCircular;
}

function emptyCheckRunsOn(jobSchema: JobSchema): void {
  if (!jobSchema['runs-on']) {
    // error
  }

  const runsOn = jobSchema['runs-on'];
  if (typeof runsOn === 'string') {
    if (runsOn === '') {
      // error
    }
    if (Array.isArray(runsOn)) {
      if (runsOn.length === 0) {
        // error
      }
    }

    // group check
  }
}
