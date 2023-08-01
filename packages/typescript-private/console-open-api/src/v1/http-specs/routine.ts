import { ProjectId, RoutineId } from '@dogu-private/types';
import { ControllerMethodSpec, ControllerSpec } from '@dogu-tech/common';
import { V1CreatePipelineResponseBody, V1FindPipelineByPipelineIdResponseBody } from '../dto/routine.dto';

const V1RoutineController = new ControllerSpec({
  path: '/v1/projects/:projectId/routines',
});

export const V1RoutinePipelineWsController = new ControllerSpec({
  path: '/v1/pipeline-state',
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
    responseBody: V1CreatePipelineResponseBody,
  }),

  findPipelineByPipelineId: new ControllerMethodSpec({
    controllerSpec: V1RoutineController,
    method: 'GET',
    path: '/:routineId/pipelines/:routinePipelineId',
    pathProvider: class {
      constructor(readonly projectId: ProjectId, readonly routineId: RoutineId) {}
    },
    responseBody: V1FindPipelineByPipelineIdResponseBody,
  }),
};
