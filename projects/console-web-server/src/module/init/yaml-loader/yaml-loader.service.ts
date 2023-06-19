import { YamlManager } from '@dogu-private/console';
import { RoutineSchema, ROUTINE_YAML_SCHEMA_PATH } from '@dogu-private/types';
import { stringifyError } from '@dogu-tech/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Ajv, { ValidateFunction } from 'ajv';
import fs from 'fs';
import { YAMLException } from 'js-yaml';
import { DoguLogger } from '../../logger/logger';

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
      // const concated = messages.join(', ');
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
    this.validateRoutineYaml(parsedYaml);

    return parsedYaml;
  }
}
