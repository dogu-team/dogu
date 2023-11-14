import { authenticate } from '@google-cloud/local-auth';
import fs from 'fs';
import { Compute, OAuth2Client } from 'google-auth-library';
import { ExternalAccountAuthorizedUserClient } from 'google-auth-library/build/src/auth/externalAccountAuthorizedUserClient';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
import { google } from 'googleapis';
import os from 'os';
import path from 'path';
import util from 'util';
import { JWTInputDto, LoadCredentialDto } from './dto';
import { transformAndValidate } from './functions';
import { logger } from './logger';

const DoguRunType = ['unknown', 'local', 'self-hosted', 'e2e', 'development', 'production', 'staging', 'test'] as const;
type DoguRunType = (typeof DoguRunType)[number];

export function isValidDoguRunType(value: string): value is DoguRunType {
  return DoguRunType.includes(value as DoguRunType);
}

function stringify(value: unknown): string {
  return util.inspect(value, { depth: 10, colors: true });
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const WORKSPACE_ROOT_PATH = path.resolve(os.homedir(), '.dogu_secret');

const SAVED_CREDENTIALS_FILE_PATH = WORKSPACE_ROOT_PATH + '/saved-token.json';
const LOCAL_CREDENTIALS_FILE_PATH = WORKSPACE_ROOT_PATH + '/local-credentials.json';
export const SERVICE_ACCOUNT_API_KEY_FILENAME = 'service-account-key.json'; // for deploy
const SERVICE_ACCOUNT_API_KEY_WORKSPACE_ROOT_PATH = WORKSPACE_ROOT_PATH + '/' + SERVICE_ACCOUNT_API_KEY_FILENAME; // for deploy

const SPREADSHEET_DRIVE_URL = 'https://drive.google.com/drive/folders/1Vqcjbi8HpoRvJ3IER7cBHbnHjXenToh1';

export class EnvGenerator {
  private readonly projectRootPath: string;
  private readonly spreadsheetId: string;
  private serviceAccountKeyPath: string;
  private isDeploy: boolean;
  private range: string;
  private doguRuntype: DoguRunType;
  private localCredentials: LoadCredentialDto | undefined;
  private savedCredentials: JWTInputDto | undefined;

  constructor(projectRootpath: string, spreadsheetId: string) {
    this.serviceAccountKeyPath = '';
    this.projectRootPath = projectRootpath;
    this.spreadsheetId = spreadsheetId;
    this.isDeploy = false;
    this.range = '';
    this.doguRuntype = 'unknown';
    this.localCredentials = undefined;
    this.savedCredentials = undefined;
  }

  private async init(): Promise<void> {
    // validate DOGU_RUN_TYPE
    const doguRunType = process.env.DOGU_RUN_TYPE ? process.env.DOGU_RUN_TYPE : '';
    if (!isValidDoguRunType(doguRunType)) {
      logger.error(`Invalid DOGU_RUN_TYPE: ${doguRunType}`);

      throw new Error(`Invalid DOGU_RUN_TYPE: ${doguRunType}`);
    }
    this.doguRuntype = doguRunType;
    this.range = `${this.doguRuntype}!A:B`;

    // check deploy or local
    const serviceAccountKeyProjectRootPath = this.projectRootPath + '/' + SERVICE_ACCOUNT_API_KEY_FILENAME;
    if (fs.existsSync(LOCAL_CREDENTIALS_FILE_PATH)) {
      this.isDeploy = false;
    } else if (fs.existsSync(SERVICE_ACCOUNT_API_KEY_WORKSPACE_ROOT_PATH)) {
      this.isDeploy = true;
      this.serviceAccountKeyPath = SERVICE_ACCOUNT_API_KEY_WORKSPACE_ROOT_PATH;
    } else if (fs.existsSync(serviceAccountKeyProjectRootPath)) {
      this.isDeploy = true;
      this.serviceAccountKeyPath = serviceAccountKeyProjectRootPath;
    } else {
      logger.error(`creadential files not found. check files path: ${LOCAL_CREDENTIALS_FILE_PATH} or download from: ${SPREADSHEET_DRIVE_URL}`);
      throw new Error('No credentials found');
    }

    // validate saved creadential
    if (fs.existsSync(SAVED_CREDENTIALS_FILE_PATH)) {
      const content = fs.readFileSync(SAVED_CREDENTIALS_FILE_PATH).toString();
      try {
        this.savedCredentials = await transformAndValidate(JWTInputDto, JSON.parse(content));
      } catch (e) {
        logger.error(`Invalid saved token found. file path: ${SAVED_CREDENTIALS_FILE_PATH}`);
        logger.error(e);
        throw new Error('Invalid saved token found');
      }
    }

    // validate local creadential
    if (fs.existsSync(LOCAL_CREDENTIALS_FILE_PATH)) {
      const content = fs.readFileSync(LOCAL_CREDENTIALS_FILE_PATH).toString();
      try {
        this.localCredentials = await transformAndValidate(LoadCredentialDto, JSON.parse(content));
      } catch (e) {
        logger.error(`Invalid local credential found. file path: ${LOCAL_CREDENTIALS_FILE_PATH}`);
        logger.error(e);
        throw new Error('Invalid local credential found');
      }
    }
  }

  private printInfo(): void {
    logger.info('env generator info');

    if (this.isDeploy) {
      logger.info('Running in deploy mode');
    } else {
      logger.info('Running in local mode');
    }

    logger.info(`Spreadsheet drive url: ${SPREADSHEET_DRIVE_URL}`);
    logger.info(`Spreadsheet ID: ${this.spreadsheetId}`);
    logger.info(`Range: ${this.range}`);
    logger.info(`Dogu Run type: ${this.doguRuntype}`);
    logger.info(`Credential path: ${LOCAL_CREDENTIALS_FILE_PATH}`);
    logger.info(`Token path: ${SAVED_CREDENTIALS_FILE_PATH}`);
    logger.info(`Service account key path: ${this.serviceAccountKeyPath}`);
  }

  private loadSavedCredentials(): JSONClient {
    if (!this.savedCredentials) {
      logger.error(`can't load saved credential. file path: ${SAVED_CREDENTIALS_FILE_PATH}`);
      throw new Error(`can't load saved credential. file path: ${SAVED_CREDENTIALS_FILE_PATH}`);
    }

    const rv = google.auth.fromJSON(this.savedCredentials);
    return rv;
  }

  private saveCredentials(client: OAuth2Client | Compute | JSONClient): void {
    if (!this.localCredentials) {
      logger.error(`can't save credential. file path: ${LOCAL_CREDENTIALS_FILE_PATH}`);
      throw new Error(`can't save credential. file path: ${LOCAL_CREDENTIALS_FILE_PATH}`);
    }

    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: this.localCredentials.installed.client_id,
      client_secret: this.localCredentials.installed.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    fs.writeFileSync(SAVED_CREDENTIALS_FILE_PATH, payload);
  }

  private async authenticateByLocalCredentialFile(): Promise<OAuth2Client> {
    try {
      const client = await authenticate({
        scopes: SCOPES,
        keyfilePath: LOCAL_CREDENTIALS_FILE_PATH,
      });
      return client;
    } catch (err) {
      logger.error(`Error authenticateByCredentialFile. check your credential file: ${LOCAL_CREDENTIALS_FILE_PATH}`);
      throw err;
    }
  }

  private async authenticateByApiServiceAccountKey(): Promise<Compute | JSONClient> {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: this.serviceAccountKeyPath,
        scopes: SCOPES,
      });
      const client = await auth.getClient();

      return client;
    } catch (err) {
      logger.error(`Error loading client secret file ${stringify(err)}`);
      throw err;
    }
  }

  private async loadAuthorizeInfo(): Promise<OAuth2Client | Compute | JSONClient> {
    if (this.isDeploy) {
      const client = await this.authenticateByApiServiceAccountKey();
      logger.info(`Using service account key file path: ${this.serviceAccountKeyPath}`);
      return client;
    }

    if (this.savedCredentials) {
      const savedClient = this.loadSavedCredentials();
      if (savedClient) {
        logger.info(`Using saved token file path: ${SAVED_CREDENTIALS_FILE_PATH}`);
        return savedClient;
      }
    }

    const client = await this.authenticateByLocalCredentialFile();
    logger.info(`Using credential file path: ${LOCAL_CREDENTIALS_FILE_PATH}`);
    if (client.credentials) {
      this.saveCredentials(client);
    }
    return client;
  }

  private async getDotEnvData(auth: OAuth2Client | Compute | JSONClient): Promise<string> {
    if (auth instanceof ExternalAccountAuthorizedUserClient) {
      throw new Error('ExternalAccountAuthorizedUserClient is not supported');
    }
    const sheets = google.sheets({ version: 'v4', auth });
    const getResRetry = async () => {
      let lastError: unknown;
      for (let i = 0; i < 5; i++) {
        try {
          logger.info(`getDotEnvData. spreadsheetId: ${this.spreadsheetId}, range: ${this.range}, retry: ${i}`);
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: this.range,
          });
          return res;
        } catch (e) {
          logger.error(`Error getDotEnvData. e: ${e}, retry: ${i}`);
          lastError = e;
        }
      }
      throw lastError;
    };

    const res = await getResRetry();

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      logger.error(`No data found. spreadsheetId: ${this.spreadsheetId}, range: ${this.range}`);
      throw new Error(`No data found. spreadsheetId: ${this.spreadsheetId}, range: ${this.range}`);
    }

    const dotEnv = rows
      .map((row) => {
        if (row.length === 2) {
          return `${String(row[0])}=${String(row[1])}`;
        } else if (row.length === 1) {
          return `${String(row[0])}=`;
        } else {
          throw new Error(`Invalid row length: ${row.length}`);
        }
      })
      .join('\n');

    return dotEnv;
  }

  private writeDotEnvFile(dotEnv: string, fileName: string): void {
    fs.writeFileSync(path.join(this.projectRootPath, fileName), dotEnv);
  }

  public async generate(fileName = '.env.local'): Promise<void> {
    await this.init();
    logger.info(`[Generating  ${fileName} at ${this.projectRootPath}]`);
    this.printInfo();
    const client = await this.loadAuthorizeInfo();
    const dotEnv = await this.getDotEnvData(client);
    this.writeDotEnvFile(dotEnv, fileName);
  }
}
