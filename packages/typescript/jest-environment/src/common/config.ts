import fs from 'fs';
import { JSONSchema7, validate } from 'json-schema';
import JSON5 from 'json5';
import _ from 'lodash';
import path from 'path';
import url from 'url';
import { logger } from './utils.js';

/**
 * @note "tsc" does not support import.meta. The transfile is in babel and the tsc generates only the type.
 */
/* @ts-ignore */
const CommonDirPath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)));
const SchemaFilePath = path.resolve(CommonDirPath, 'dogu.config.schema.json');
const ConfigFileName = 'dogu.config.json';
const ApiBaseUrlPattern = /^(https?):\/\/([^:\/\s]+)(:([0-9]+))?\/?/i;

async function loadSchema(): Promise<JSONSchema7> {
  const content = await fs.promises.readFile(SchemaFilePath, 'utf8');
  const schema = JSON5.parse(content) as JSONSchema7;
  return schema;
}

async function loadConfig(): Promise<object> {
  logger.info(`load ${ConfigFileName}...`);
  const content = await fs.promises.readFile(ConfigFileName, 'utf8');
  const config = JSON5.parse(content) as object;
  return config;
}

async function validateConfig(config: object, schema: JSONSchema7): Promise<void> {
  const validationResult = validate(config, schema);
  if (!validationResult.valid) {
    throw new Error(`Invalid config: ${JSON.stringify(validationResult.errors)}`);
  }
}

export class Config {
  private constructor(private readonly value: unknown) {}

  static async create(): Promise<Config> {
    const isConfigExist = await fs.promises.stat(ConfigFileName).catch(() => false);
    if (isConfigExist) {
      const schema = await loadSchema();
      const config = await loadConfig();
      await validateConfig(config, schema);
      return new Config(config);
    }
    return new Config({});
  }

  get apiBaseUrl(): string {
    return process.env.DOGU_API_BASE_URL || (_.get(this.value, 'apiBaseUrl') as unknown as string);
  }

  get organizationId(): string {
    return process.env.DOGU_ORGANIZATION_ID || (_.get(this.value, 'organizationId') as unknown as string);
  }

  get projectId(): string {
    return process.env.DOGU_PROJECT_ID || (_.get(this.value, 'projectId') as unknown as string);
  }

  get token(): string {
    return process.env.DOGU_TOKEN || (_.get(this.value, 'token') as unknown as string);
  }

  get runsOn(): string | string[] {
    return process.env.DOGU_RUNS_ON || (_.get(this.value, 'runsOn') as unknown as string | string[]);
  }

  get browserName(): string | undefined {
    return process.env.DOGU_BROWSER_NAME || _.get(this.value, 'browserName');
  }

  get browserVersion(): string | undefined {
    return process.env.DOGU_BROWSER_VERSION || _.get(this.value, 'browserVersion');
  }

  get deviceId(): string {
    if (!process.env.DOGU_DEVICE_ID) {
      throw new Error('deviceId is not defined');
    }
    return process.env.DOGU_DEVICE_ID;
  }

  get stepId(): string {
    if (!process.env.DOGU_STEP_ID) {
      throw new Error('stepId is not defined');
    }
    return process.env.DOGU_STEP_ID;
  }

  get hostToken(): string {
    if (!process.env.DOGU_HOST_TOKEN) {
      throw new Error('hostToken is not defined');
    }
    return process.env.DOGU_HOST_TOKEN;
  }

  parseApiBaseUrl(): { protocol: string; hostname: string; port: number } {
    const { apiBaseUrl } = this;
    const matches = apiBaseUrl.match(ApiBaseUrlPattern);
    if (!matches) {
      throw new Error(`Invalid apiBaseUrl: ${apiBaseUrl}`);
    }
    const [, protocol, hostname, , port] = matches;
    if (typeof protocol !== 'string') {
      throw new Error(`Invalid protocol: ${protocol}`);
    }
    if (typeof hostname !== 'string') {
      throw new Error(`Invalid hostname: ${hostname}`);
    }
    if (port && typeof port !== 'string') {
      throw new Error(`Invalid port: ${port}`);
    }
    if (port) {
      const portNumber = parseInt(port, 10);
      if (Number.isNaN(portNumber)) {
        throw new Error(`Invalid port: ${port}`);
      }
      return { protocol, hostname, port: portNumber };
    }
    return { protocol, hostname, port: protocol === 'https' ? 443 : 80 };
  }
}
