import {
  Action,
  BatchHttpProxyRequest,
  BatchHttpProxyResponse,
  ErrorResult,
  EventParam,
  EventParamValue,
  EventResult,
  HttpProxyRequest,
  HttpProxyResponse,
  RequestParam,
  RequestParamValue,
  ResponseResult,
  ResponseResultValue,
  Run,
  RunStep,
  UpdateAgent,
} from '@dogu-private/console-host-agent';
import { Controller } from '@nestjs/common';
import { Ctx, Payload } from '@nestjs/microservices';
import { HttpProxyProcessor } from '../http-ws-proxy/http-proxy.processor';
import { MessageContext } from '../message/message.types';
import { ActionProcessor } from '../processor/action.processor';
import { CommandProcessRegistry } from '../processor/command.process-registry';
import { DeviceJobStepProcessor } from '../processor/device-job-step.processor';
import { UpdateProcessor } from '../processor/update.processor';
import { StepMessageContext } from '../step/step.types';
import { OnConsoleMessage } from '../types';

@Controller()
export class MessageRequestResponseController {
  constructor(
    private readonly deviceJobStepProcessor: DeviceJobStepProcessor,
    private readonly httpProxyProcessor: HttpProxyProcessor,
    private readonly commandProcessRegistry: CommandProcessRegistry,
    private readonly actionProcessor: ActionProcessor,
    private readonly updateProcessor: UpdateProcessor,
  ) {}

  @OnConsoleMessage(RequestParam, ResponseResult)
  async onRequest(@Payload() param: RequestParam, @Ctx() context: MessageContext): Promise<ResponseResult> {
    const { value } = param;
    const { router } = context;
    const responseValue = await router.route<RequestParamValue, ResponseResultValue>(value, context);
    const result: ResponseResult = {
      kind: 'ResponseResult',
      value: responseValue,
    };
    return result;
  }

  @OnConsoleMessage(EventParam, EventResult)
  async onEventParam(@Payload() param: EventParam, @Ctx() context: MessageContext): Promise<EventResult> {
    const { value } = param;
    const { router } = context;
    await router.route<EventParamValue, void>(value, context);
    const result: EventResult = {
      kind: 'EventResult',
    };
    return result;
  }

  @OnConsoleMessage(HttpProxyRequest, HttpProxyResponse)
  async onHttpProxyRequest(@Payload() param: HttpProxyRequest, @Ctx() context: MessageContext): Promise<HttpProxyResponse> {
    const result = await this.httpProxyProcessor.httpRequest(param, context);
    return result;
  }

  @OnConsoleMessage(BatchHttpProxyRequest, BatchHttpProxyResponse)
  async onBatchHttpProxyRequest(@Payload() param: BatchHttpProxyRequest, @Ctx() context: MessageContext): Promise<BatchHttpProxyResponse> {
    const result = await this.httpProxyProcessor.batchHttpRequest(param, context);
    return result;
  }

  @OnConsoleMessage(RunStep, ErrorResult)
  onRunStep(@Payload() param: RunStep, @Ctx() context: MessageContext): Promise<ErrorResult> {
    return this.deviceJobStepProcessor.onRunStep(param, context);
  }

  @OnConsoleMessage(Run, ErrorResult)
  onRun(@Payload() param: Run, @Ctx() context: MessageContext): Promise<ErrorResult> {
    const { run } = param;
    let cwd = context instanceof StepMessageContext ? context.workingPath : process.cwd();
    return this.commandProcessRegistry.commandLine(run, { cwd }, context);
  }

  @OnConsoleMessage(Action, ErrorResult)
  onAction(@Payload() param: Action, @Ctx() context: MessageContext): Promise<ErrorResult> {
    return this.actionProcessor.action(param, context);
  }

  @OnConsoleMessage(UpdateAgent, ErrorResult)
  onUpdateAgent(@Payload() param: UpdateAgent, @Ctx() context: MessageContext): Promise<ErrorResult> {
    return this.updateProcessor.update(param);
  }
}
