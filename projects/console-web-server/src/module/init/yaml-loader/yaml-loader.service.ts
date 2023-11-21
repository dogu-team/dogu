import { YamlManager } from '@dogu-private/console';
import { isAllowedBrowserName, isValidPlatformType, RoutineSchema, ROUTINE_YAML_SCHEMA_PATH } from '@dogu-private/types';
import { stringifyError } from '@dogu-tech/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Ajv, { ValidateFunction } from 'ajv';
import fs from 'fs';
import { YAMLException } from 'js-yaml';
import _ from 'lodash';
import { FeatureConfig } from '../../../feature.config';
import { DoguLogger } from '../../logger/logger';
import { parseRunsOn } from '../../routine/pipeline/pipeline.common';

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
      const instancePaths = errors ? errors.map((error) => error.instancePath) : [];
      const errorMsg = instancePaths.length > 0 ? `Invalid Routine Yaml. Please check yaml path. path: ${instancePaths[0]}.` : `Invalid Routine Yaml. Please check yaml.`;
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
    if (FeatureConfig.get('licenseModule') === 'cloud') {
      this.validateDeviceModelAndRunOn(parsedYaml);
    } else {
      this.validateRunsOn(parsedYaml);
    }
    this.validateRoutineJob(parsedYaml);
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
            if (FeatureConfig.get('licenseModule') === 'cloud') {
              if (step.run) {
                return new Error(`run is not allowed on step. job [${jobName}], step [${index + 1}]`);
              }
            }

            if (step.uses && step.run) {
              return new Error(`Choose one of uses or run. job [${jobName}], step [${index + 1}]`);
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

  private validateDeviceModelAndRunOn(parsedYaml: RoutineSchema): void {
    const { jobs } = parsedYaml;
    const errors = _.entries(jobs)
      .map(([jobName, jobValue]) => {
        const { deviceModel } = jobValue;
        const runsOn = jobValue['runs-on'];
        if (deviceModel && runsOn) {
          return new Error(`Cannot specify both deviceModel and runs-on on job [${jobName}]`);
        }

        if (!deviceModel && !runsOn) {
          return new Error(`Specify either deviceModel or runs-on on job [${jobName}]`);
        }

        if (!deviceModel && runsOn) {
          try {
            parseRunsOn(jobName, runsOn);
            return null;
          } catch (error) {
            return error;
          }
        }

        return null;
      })
      .filter((error): error is Error => !!error);

    if (errors.length > 0) {
      throw new HttpException(errors.map((error) => error.message).join(', '), HttpStatus.BAD_REQUEST);
    }
  }

  private validateRunsOn(parsedYaml: RoutineSchema): void {
    const { jobs } = parsedYaml;
    const errors = _.entries(jobs)
      .map(([jobName, jobValue]) => ({ jobName, runsOn: jobValue['runs-on'] }))
      .map(({ jobName, runsOn }) => {
        try {
          parseRunsOn(jobName, runsOn);
          return null;
        } catch (error) {
          return error;
        }
      })
      .filter((error): error is Error => !!error);

    if (errors.length > 0) {
      throw new HttpException(errors.map((error) => error.message).join(', '), HttpStatus.BAD_REQUEST);
    }
  }

  private validateRoutineJob(parsedYaml: RoutineSchema): void {
    const { jobs } = parsedYaml;
    const errors = _.entries(jobs)
      .map(([jobName, jobValue]) => {
        const { browserName, appVersion } = jobValue;
        if (browserName && appVersion) {
          return new Error(`Cannot specify both browserName and appVersion on job [${jobName}]`);
        }

        if (browserName && !isAllowedBrowserName(browserName)) {
          return new Error(`Invalid browserName [${browserName}] on job [${jobName}]`);
        }

        if (appVersion) {
          if (typeof appVersion === 'object') {
            const invalids = _.keys(appVersion).filter((value) => !isValidPlatformType(value));
            if (invalids.length > 0) {
              return new Error(`Invalid platform type [${invalids.join(', ')}] on job [${jobName}]`);
            }
          }
        }

        return null;
      })
      .filter((error): error is Error => !!error);

    if (errors.length > 0) {
      throw new HttpException(errors.map((error) => error.message).join(', '), HttpStatus.BAD_REQUEST);
    }
  }
}
