import { DefaultHttpOptions } from '@dogu-tech/common';
import { RelayRequest, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import stream, { Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { DoguLogger } from '../logger/logger';

export interface DeviceWebDriverEndpointHandlerResultError {
  status: number;
  error: Error;
  data: Object;
}

export interface DeviceWebDriverEndpointHandlerResultOk {
  error?: undefined;
  request: RelayRequest;
}

export type DeviceWebDriverEndpointHandlerResult = DeviceWebDriverEndpointHandlerResultError | DeviceWebDriverEndpointHandlerResultOk;

export abstract class DeviceWebDriverEndpointHandler {
  abstract onRequest(endpoint: WebDriverEndPoint, request: RelayRequest, logger: DoguLogger): Promise<DeviceWebDriverEndpointHandlerResult>;
}

export class DeviceWebDriverNewSessionEndpointHandler extends DeviceWebDriverEndpointHandler {
  async onRequest(endpoint: WebDriverEndPoint, request: RelayRequest, logger: DoguLogger): Promise<DeviceWebDriverEndpointHandlerResult> {
    if (endpoint.info.type !== 'new-session') {
      return { status: 400, error: new Error('Internal error. endpoint type is not delete-session'), data: {} };
    }
    if (!endpoint.info.capabilities.doguOptions.appUrl) {
      return { status: 400, error: new Error('App url not specified'), data: {} };
    }
    const url = endpoint.info.capabilities.doguOptions.appUrl;

    const tempFileName = `${uuidv4()}.${path.extname(url)}`;
    const tempFilePath = path.resolve(HostPaths.tempPath, tempFileName);
    if (!fs.existsSync(HostPaths.tempPath)) {
      fs.mkdirSync(HostPaths.tempPath, { recursive: true });
    }
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {},
      timeout: DefaultHttpOptions.request.timeout,
    });
    if (!(response.data instanceof Stream)) {
      throw new Error('response.data is not stream');
    }
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);
    try {
      await stream.promises.finished(writer);
    } catch (error) {
      writer.close();
      throw error;
    }
    // const dirPath = path.dirname(filePath);
    // await fs.promises.mkdir(dirPath, { recursive: true });
    // await fs.promises.rename(tempFilePath, filePath);
    logger.info('File downloaded', { tempFilePath });

    endpoint.info.capabilities.setApp(tempFilePath);

    return { request, ...{ reqBody: endpoint.info.capabilities.origin } };
  }
}
