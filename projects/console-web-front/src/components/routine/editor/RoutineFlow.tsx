import { JobSchema } from '@dogu-private/types';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import ReactFlow, { Background, Controls, Edge, MiniMap, Node as ReactFlowNode, NodeTypes, useEdgesState, useNodesState } from 'reactflow';
import styled from 'styled-components';
import 'reactflow/dist/style.css';

import useRoutineEditorStore from '../../../stores/routine-editor';
import { RoutineEditMode, RoutineGUIEditorNodeType } from '../../../types/routine';
import JobNode, { JobNodeData } from './gui/JobNode';
import StepGroupNode, { StepGroupNodeData } from './gui/StepGroupNode';
import StepNode, { StepNodeData } from './gui/StepNode';

interface Props {}

const nodeTypes: NodeTypes = {
  [RoutineGUIEditorNodeType.JOB]: JobNode,
  [RoutineGUIEditorNodeType.STEP_GROUP]: StepGroupNode,
  [RoutineGUIEditorNodeType.STEP]: StepNode,
};

const RoutineFlow = ({}: Props) => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const routineSchema = useRoutineEditorStore((state) => state.schema);

  useEffect(() => {
    const jobs = routineSchema.jobs;
    const jobNames = Object.keys(jobs);

    if (jobNames.length === 0) {
      return;
    }

    const nodes: ReactFlowNode[] = [];

    /**
     * Algorithm
     *
     * 1st gen
     * order jobs which needs is empty
     *
     * and iteration starts from here
     *
     * 2nd gen
     * order jobs which needs is 1st gen
     * if more than two 2nd gen jobs need the 1st gen job, push other 1st gen jobs y position under it.
     *
     * 3rd gen
     * order jobs which needs is 2nd gen
     * if more than two 3rd gen jobs need the 2nd gen job, push other 2nd gen jobs y position under it.
     *
     * ...
     *
     * iterate until done;
     */

    const pushJobRelatedNodes = (generationNodes: ReactFlowNode[], generation: number, jobName: string, job: JobSchema, jobYPos: number) => {
      generationNodes.push({
        id: `job-${jobName}`,
        type: RoutineGUIEditorNodeType.JOB,
        data: { name: jobName, job },
        position: { x: 48 + generation * 496, y: jobYPos },
        zIndex: 1,
      });

      stepGroupNodes.push({
        id: `step-group-${jobName}`,
        type: RoutineGUIEditorNodeType.STEP_GROUP,
        data: { steps: job.steps },
        parentNode: `job-${jobName}`,
        position: { x: 16, y: 64 },
        extent: 'parent',
        zIndex: 2,
      });

      job.steps.forEach((step, i) => {
        const stepYPos = 64 * i + 48;
        stepNodes.push({
          id: `step-${jobName}-${step.name}-${i}`,
          type: RoutineGUIEditorNodeType.STEP,
          data: { step, jobName },
          position: { x: 16, y: stepYPos },
          parentNode: `step-group-${jobName}`,
          extent: 'parent',
          zIndex: 3,
        });
      });
    };

    const locateGenerationNodes = (generationNodes: ReactFlowNode[], generation: number, generationJobNames: string[]) => {
      let yPos = 48;

      generationJobNames.forEach((jobName) => {
        const job = jobs[jobName];
        pushJobRelatedNodes(generationNodes, generation, jobName, job, yPos);
        yPos += 304 + job.steps.length * 64 + 96;
      });
      jobsPerGeneration.push(generationNodes);
    };

    const jobSet = new Set<string>();
    jobNames.forEach((jobName) => {
      jobSet.add(jobName);
    });

    // steps nodes must be pushed after all jobs nodes due to z-index
    const jobsPerGeneration: ReactFlowNode<JobNodeData>[][] = [];
    const stepGroupNodes: ReactFlowNode<StepGroupNodeData>[] = [];
    const stepNodes: ReactFlowNode<StepNodeData>[] = [];

    // 1st gen
    // get empty needs jobs
    const firstGenerations: ReactFlowNode[] = [];

    const emptyNeedsJobs = jobNames.filter((jobName) => {
      const job = jobs[jobName];
      return !job.needs || job.needs.length === 0;
    });

    // remove job from jobSet
    emptyNeedsJobs.forEach((jobName) => jobSet.delete(jobName));

    locateGenerationNodes(firstGenerations, 1, emptyNeedsJobs);

    // iterations starts from 2nd gen
    let currentGeneration = 2;

    while (true) {
      const currentGenerationJobs: ReactFlowNode[] = [];
      const previousGenerationJobs = jobsPerGeneration[currentGeneration - 2];
      const previousGenerationJobNames = previousGenerationJobs.map((job) => job.data.name);

      let isNeedsInJobNames = true;
      const currentGenerationJobNames = Array.from(jobSet).filter((jobName) => {
        const job = jobs[jobName];

        const needs = job.needs as string[] | string;

        if (typeof needs === 'string') {
          if (!jobNames.includes(needs)) {
            isNeedsInJobNames = false;
          }

          return previousGenerationJobNames.includes(needs);
        } else {
          if (!needs.every((need) => jobNames.includes(need))) {
            isNeedsInJobNames = false;
          }
          return !!needs.find((need) => previousGenerationJobNames.includes(need));
        }
      });

      if (!isNeedsInJobNames) {
        alert('There is a job that needs a job that is not in the job list. Please check your job dependencies.');
        router.replace({ pathname: router.pathname, query: { ...router.query, mode: RoutineEditMode.SCRIPT } }, undefined, { shallow: true });
        break;
      }

      // remove job from jobSet
      currentGenerationJobNames.forEach((jobName) => jobSet.delete(jobName));
      locateGenerationNodes(currentGenerationJobs, currentGeneration, currentGenerationJobNames);

      if (jobSet.size === 0) {
        break;
      }

      currentGeneration++;
    }

    jobsPerGeneration.forEach((gen) => {
      nodes.push(...gen);
    });
    nodes.push(...stepGroupNodes);
    nodes.push(...stepNodes);

    const edges: Edge[] = [];
    jobNames.forEach((jobName) => {
      const job = jobs[jobName];

      if (!job.needs || job.needs.length === 0) {
      } else {
        if (typeof job.needs === 'string') {
          edges.push({
            id: `e-job-${jobName}-${job.needs}`,
            target: `job-${jobName}`,
            source: `job-${job.needs}`,
            zIndex: 1,
          });
        } else {
          job.needs.forEach((need, index) => {
            edges.push({
              id: `e-job-${jobName}-${need}`,
              target: `job-${jobName}`,
              source: `job-${need}`,
              zIndex: 1,
            });
          });
        }
      }

      if (job.steps.length === 0) {
        return;
      }

      job.steps.forEach((step, i) => {
        if (i === 0) {
          return;
        }

        edges.push({
          id: `e-step-${jobName}-${step.name}-${i}`,
          target: `step-${jobName}-${step.name}-${i}`,
          source: `step-${jobName}-${job.steps[i - 1].name}-${i - 1}`,
          zIndex: 6,
        });
      });
    });

    setNodes(nodes);
    setEdges(edges);
  }, [routineSchema]);

  return (
    <FlowWrapper ref={wrapperRef}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onEdgesChange={onEdgesChange} onNodesChange={onNodesChange} snapGrid={[16, 16]} snapToGrid={true}>
        <MiniMap zoomable pannable />
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </FlowWrapper>
  );
};

export default RoutineFlow;

const FlowWrapper = styled.div`
  height: 100%;
  border-radius: 1rem;
  border: 1px solid ${(props) => props.theme.colors.gray2};
  flex: 1;
  overflow: hidden;

  /* react-flow css override */
  .react-flow__attribution > a {
    display: none;
  }

  /* .react-flow__node.selected {
    border: 1px solid ${(props) => props.theme.colors.black};
  } */
`;
