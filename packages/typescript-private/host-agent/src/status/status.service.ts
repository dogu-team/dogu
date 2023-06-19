import { Status } from '@dogu-private/dost-children';
import { Code } from '@dogu-private/types';
import { Instance, parseAxiosError } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OnHostConnectingEvent, OnHostDisconnectedEvent, OnHostResolvedEvent } from '../host/host.events';

@Injectable()
export class StatusService {
  private _connectionStatus: Instance<typeof Status.getConnectionStatus.responseBody> = {
    status: 'connecting',
    updatedAt: new Date(),
  };
  set connectionStatus(value: Omit<Readonly<Instance<typeof Status.getConnectionStatus.responseBody>>, 'updatedAt'>) {
    this._connectionStatus = {
      ...value,
      updatedAt: new Date(),
    };
  }
  get connectionStatus(): Readonly<Instance<typeof Status.getConnectionStatus.responseBody>> {
    return this._connectionStatus;
  }

  @OnEvent(OnHostConnectingEvent.key)
  onHostConnecting(): void {
    this.connectionStatus = {
      status: 'connecting',
      code: undefined,
    };
  }

  @OnEvent(OnHostResolvedEvent.key)
  onHostResolved(): void {
    this.connectionStatus = {
      status: 'connected',
      code: undefined,
    };
  }

  @OnEvent(OnHostDisconnectedEvent.key)
  onHostDisconnected(value: Instance<typeof OnHostDisconnectedEvent.value>): void {
    const { error } = value;
    const code = this.disconnectedErrorToCode(error);
    this.connectionStatus = {
      status: 'disconnected',
      code,
    };
  }

  private disconnectedErrorToCode(error: unknown): Code {
    const parsed = parseAxiosError(error);
    if (parsed instanceof Error) {
      return Code.CODE_HOST_AGENT_UNEXPECTED_ERROR;
    }
    const { code, response } = parsed;
    if (code === 'ECONNREFUSED') {
      return Code.CODE_HOST_AGENT_CONNECTION_REFUSED;
    } else if (response !== undefined) {
      const { status } = response;
      if (status === 401) {
        return Code.CODE_HOST_AGENT_INVALID_TOKEN;
      } else {
        return Code.CODE_HOST_AGENT_UNEXPECTED_ERROR;
      }
    } else {
      return Code.CODE_HOST_AGENT_UNEXPECTED_ERROR;
    }
  }
}
