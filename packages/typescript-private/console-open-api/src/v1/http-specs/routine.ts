import { ProjectId, RoutineId } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';

const RoutineController = new ControllerSpec({
  path: '/v1/projects/:projectId/routines',
});

export const RoutineV1 = {
  controller: RoutineController,

  createPipeline: new ControllerMethodSpec({
    controllerSpec: RoutineController,
    method: 'POST',
    path: '/:routineId/pipelines',
    pathProvider: class {
      constructor(readonly projectId: ProjectId, readonly routineId: RoutineId) {}
    },
    responseBody: class {},
  }),
};
