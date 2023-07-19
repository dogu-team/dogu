import fs from 'fs';
import { JSONSchema7, validate } from 'json-schema';
import JSON5 from 'json5';
import _ from 'lodash';
import path from 'path';
import url from 'url';
import { createLogger } from './common.js';

/**
 * @note "tsc" does not support import.meta. The transfile is in babel and the tsc generates only the type.
 */
/* @ts-ignore */
const CommonDirPath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)));
const SchemaFilePath = path.resolve(CommonDirPath, 'dogu.config.schema.json');
const ConfigFileName = 'dogu.config.json';
const ApiBaseUrlPattern = /^(https?):\/\/([^:\/\s]+)(:([0-9]+))?\/?/i;

async function loadConfigFileSchema(): Promise<JSONSchema7> {
  const content = await fs.promises.readFile(SchemaFilePath, 'utf8');
  const schema = JSON5.parse(content) as JSONSchema7;
  return schema;
}

async function loadConfigFile(): Promise<object> {
  const configFilePath = path.resolve(process.cwd(), ConfigFileName);
  const content = await fs.promises.readFile(configFilePath, 'utf8');
  const config = JSON5.parse(content) as object;
  return config;
}

async function validateConfigFile(config: object, schema: JSONSchema7): Promise<void> {
  const validationResult = validate(config, schema);
  if (!validationResult.valid) {
    throw new Error(`Invalid config: ${JSON.stringify(validationResult.errors)}`);
  }
}

async function loadAndValidateConfigFile(): Promise<object> {
  const schema = await loadConfigFileSchema();
  const config = await loadConfigFile();
  await validateConfigFile(config, schema);
  return config;
}

async function isConfigFileExist(): Promise<boolean> {
  const isConfigFileExist = await fs.promises.stat(ConfigFileName).catch(() => null);
  return !!isConfigFileExist;
}

export class DoguConfig {
  private readonly logger = createLogger('DoguConfig');

  constructor(private readonly configFileObject: object) {}

  get version(): string {
    return _.get(this.configFileObject, 'version') as unknown as string;
  }

  get apiBaseUrl(): string {
    return process.env.DOGU_API_BASE_URL || (_.get(this.configFileObject, 'apiBaseUrl') as unknown as string);
  }

  get organizationId(): string {
    return process.env.DOGU_ORGANIZATION_ID || (_.get(this.configFileObject, 'organizationId') as unknown as string);
  }

  get projectId(): string {
    return process.env.DOGU_PROJECT_ID || (_.get(this.configFileObject, 'projectId') as unknown as string);
  }

  get token(): string {
    return process.env.DOGU_TOKEN || (_.get(this.configFileObject, 'token') as unknown as string);
  }

  get runsOn(): string | string[] {
    return process.env.DOGU_RUNS_ON || (_.get(this.configFileObject, 'runsOn') as unknown as string | string[]);
  }

  get browserName(): string | undefined {
    return process.env.DOGU_BROWSER_NAME || _.get(this.configFileObject, 'browserName');
  }

  get browserVersion(): string | undefined {
    return process.env.DOGU_BROWSER_VERSION || _.get(this.configFileObject, 'browserVersion');
  }

  get deviceId(): string | undefined {
    return process.env.DOGU_DEVICE_ID;
  }

  get stepId(): string | undefined {
    return process.env.DOGU_STEP_ID;
  }

  get hostToken(): string | undefined {
    return process.env.DOGU_HOST_TOKEN;
  }

  parseApiBaseUrl(): { protocol: string; hostname: string; port: number } {
    const { apiBaseUrl } = this;
    const matches = apiBaseUrl.match(ApiBaseUrlPattern);
    if (!matches) {
      throw new Error(`Invalid apiBaseUrl: ${apiBaseUrl}`);
    }
    const [, protocol, hostname, , port] = matches;
    if (typeof protocol !== 'string' || typeof hostname !== 'string' || typeof port !== 'string') {
      throw new Error(`Internal error: ${apiBaseUrl} is not matched`);
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

export class DoguConfigFactory {
  private readonly logger = createLogger('DoguConfigFactory');

  async create(): Promise<DoguConfig> {
    if (await isConfigFileExist()) {
      const configFileObject = await loadAndValidateConfigFile();
      this.logger.info('dogu.config.json is loaded');
      return new DoguConfig(configFileObject);
    }
    this.logger.info('dogu.config.json is not found. use default config');
    return new DoguConfig({});
  }
}
