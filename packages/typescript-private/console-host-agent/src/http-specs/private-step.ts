import { OrganizationId, PIPELINE_STATUS, RoutineStepId } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsDate, IsEnum } from 'class-validator';

export class UpdateStepStatusRequestBody {
  @IsEnum(PIPELINE_STATUS)
  status!: PIPELINE_STATUS;

  @IsDate()
  @Type(() => Date)
  localTimeStamp!: Date;
}

const PrivateStepController = new ControllerSpec({
  path: '/private/organizations/:organizationId/steps',
});

export const PrivateStep = {
  controller: PrivateStepController,

  updateStepStatus: new ControllerMethodSpec({
    controllerSpec: PrivateStepController,
    method: 'PATCH',
    path: '/:stepId/status',
    pathProvider: class {
      constructor(
        readonly organizationId: OrganizationId,
        readonly stepId: RoutineStepId,
      ) {}
    },
    requestBody: UpdateStepStatusRequestBody,
  }),
};
