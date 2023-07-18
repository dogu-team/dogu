import { ProjectId, RoutineId } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';

const V1RoutineController = new ControllerSpec({
  path: '/v1/projects/:projectId/routines',
});

export const V1Routine = {
  controller: V1RoutineController,

  createPipeline: new ControllerMethodSpec({
    controllerSpec: V1RoutineController,
    method: 'POST',
    path: '/:routineId/pipelines',
    pathProvider: class {
      constructor(readonly projectId: ProjectId, readonly routineId: RoutineId) {}
    },
    responseBody: class {},
  }),
};
