import { YamlManager } from '@dogu-private/console';
import { isAllowedBrowserName, RoutineSchema, ROUTINE_YAML_SCHEMA_PATH, RunsOnWithBrowserNameSchema } from '@dogu-private/types';
import { stringifyError } from '@dogu-tech/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Ajv, { ValidateFunction } from 'ajv';
import fs from 'fs';
import { YAMLException } from 'js-yaml';
import { DoguLogger } from '../../logger/logger';
import { PipelineService } from '../../routine/pipeline/pipeline.service';

@Injectable()
export class YamlLoaderService {
  private routineYamlSchema!: JSON;
  private routineValidator!: ValidateFunction;

  constructor(private readonly logger: DoguLogger) {}

  onModuleInit(): void {
    this.logger.info('YamlLoaderService onModuleInit');

    this.routineYamlSchema = this.loadYamlRaw<JSON>(fs.readFileSync(ROUTINE_YAML_SCHEMA_PATH, 'utf8'));

    const ajv = new Ajv();
    this.routineValidator = ajv.compile(this.routineYamlSchema);
  }

  private validateRoutineYaml(parsedYaml: RoutineSchema): void {
    if (!this.routineValidator(parsedYaml)) {
      const { errors } = this.routineValidator;

      const messages = errors ? errors.map(stringifyError) : [];
      const instancePaths = errors ? errors.map((error) => error.instancePath) : [];
      const errorMsg = instancePaths.length > 0 ? `Invalid Routine Yaml. Please check yaml path. Path: ${instancePaths[0]}.` : `Invalid Routine Yaml. Please check yaml.`;
      throw new HttpException(errorMsg, HttpStatus.BAD_REQUEST);
    }
  }

  private loadYamlRaw<T>(yamlRaw: string): T {
    try {
      const yaml = YamlManager.parseYaml<T>(yamlRaw);
      return yaml;
    } catch (e) {
      if (e instanceof YAMLException) {
        throw new HttpException(`${stringifyError(e.message)}`, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(`yaml load error.`, HttpStatus.BAD_REQUEST);
      }
    }
  }

  public routineYamlToObject(yamlRaw: string): RoutineSchema {
    const parsedYaml = this.loadYamlRaw<RoutineSchema>(yamlRaw);
    this.validateRunsOnType(parsedYaml);
    this.validateRunsOnWithBrowserNameSchema(parsedYaml);
    this.validateRoutineStep(parsedYaml);
    this.validateRoutineYaml(parsedYaml);
    return parsedYaml;
  }

  private validateRoutineStep(parsedYaml: RoutineSchema): void {
    const { jobs } = parsedYaml;
    const errors = Object.keys(jobs)
      .map((jobName) => ({ jobName, steps: jobs[jobName].steps }))
      .map(({ jobName, steps }) => {
        const errors = steps
          .map((step, index) => {
            if (step.uses && step.run) {
              return new Error(`Choose one of uses or run. Job: ${jobName}, Step: ${index + 1}`);
            }
            return null;
          })
          .filter((error): error is Error => !!error);
        return errors;
      })
      .flat()
      .filter((error): error is Error => !!error);

    if (errors.length > 0) {
      throw new HttpException(errors.map((error) => error.message).join(', '), HttpStatus.BAD_REQUEST);
    }
  }

  private validateRunsOnType(parsedYaml: RoutineSchema): void {
    const { jobs } = parsedYaml;
    const errors = Object.keys(jobs)
      .map((jobName) => ({ jobName, runsOn: jobs[jobName]['runs-on'] }))
      .map(({ jobName, runsOn }) => {
        try {
          PipelineService.parseRunsOnOrThrow(runsOn, jobName);
          return null;
        } catch (error) {
          return error;
        }
      })
      .filter((error) => error !== null)
      .map((error) => error as Error);
    if (errors.length > 0) {
      throw new HttpException(errors.map((error) => error.message).join(', '), HttpStatus.BAD_REQUEST);
    }
  }

  private validateRunsOnWithBrowserNameSchema(parsedYaml: RoutineSchema): void {
    const { jobs } = parsedYaml;
    const errors = Object.keys(jobs)
      .map((jobName) => jobs[jobName]['runs-on'])
      .filter((runsOn) => typeof runsOn === 'object')
      .map((runsOn) => runsOn as object)
      .filter((runsOn): runsOn is RunsOnWithBrowserNameSchema => 'browserName' in runsOn)
      .map((runsOn) => {
        const { browserName, tag } = runsOn;
        if (!isAllowedBrowserName(browserName)) {
          return new Error(`Invalid browser [${browserName}] with tag [${tag}]`);
        } else {
          return null;
        }
      })
      .filter((error): error is Error => error !== null);

    if (errors.length > 0) {
      throw new HttpException(errors.map((error) => error.message).join(', '), HttpStatus.BAD_REQUEST);
    }
  }
}
