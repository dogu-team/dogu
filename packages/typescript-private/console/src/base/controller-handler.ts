import { ControllerHandlerId } from '@dogu-private/types';

export interface ControllerHandlerBase {
  //entity
  controllerHandlerId: ControllerHandlerId;
  name: string;
  controllerName: string;
  actionName: string;
  methodName: string;
  createdAt: Date;
  updatedAt: Date;
}
