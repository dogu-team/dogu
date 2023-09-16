import { LoadingOutlined } from '@ant-design/icons';
import { JobDisplayQuery, JobElement } from '@dogu-private/console';
import { OrganizationId, RoutinePipelineId, ProjectId } from '@dogu-private/types';
import styled from 'styled-components';
import useSWR from 'swr';
import ReactFlow, { useNodesState, useEdgesState, Node, Position, Edge, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { isAxiosError } from 'axios';

import { swrAuthFetcher } from '../../api';
import ErrorBox from '../common/boxes/ErrorBox';
import JobStatusIcon from './JobStatusIcon';
import useLivePipelineStore from '../../stores/live-pipeline';
import { getErrorMessageFromAxios } from '../../utils/error';

interface NodeItemProps {
  job: JobElement;
}

const NodeItem = ({ job }: NodeItemProps) => {
  const router = useRouter();

  return (
    <ItemBox
      href={`/dashboard/${router.query.orgId}/projects/${router.query.pid}/routines/${router.query.pipelineId}/jobs/${job.routineJobId}`}
    >
      <JobStatusIcon status={job.status} />
      <p>{job.name}</p>
    </ItemBox>
  );
};

interface Props {
  orgId: OrganizationId;
  projectId: ProjectId;
  pipelineId: RoutinePipelineId;
}

const JobFlowController = ({ orgId, projectId, pipelineId }: Props) => {
  const { data, isLoading, error, mutate } = useSWR<JobElement[]>(
    `/organizations/${orgId}/projects/${projectId}/pipelines/${pipelineId}/jobs?display=${JobDisplayQuery.TREE}`,
    swrAuthFetcher,
  );
  const livePipeline = useLivePipelineStore((state) => state.pipeline);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (data) {
      // get unique nodes
      const getNodes = (jobElements: JobElement[]): JobElement[][] => {
        const nodes: JobElement[][] = [];

        // init 1 gen nodes
        nodes.push(jobElements);

        // search nodes(BFS)
        let i = 0;
        while (true) {
          const nextGenNodes: JobElement[] = [];
          nodes[i].forEach((node) => {
            node.children.forEach((item) => {
              const existNode = nodes.flat().find((fn) => fn.routineJobId === item.routineJobId);

              if (!existNode) {
                if (!nextGenNodes.find((fn) => fn.routineJobId === item.routineJobId)) {
                  nextGenNodes.push(item);
                }
              } else {
                // remove exists & insert to this generation
                const gen = nodes.findIndex((item) => item.find((fn) => fn.routineJobId === existNode.routineJobId));

                if (gen > -1) {
                  nodes[gen] = nodes[gen].filter((gn) => gn.routineJobId !== existNode.routineJobId);
                  nextGenNodes.push(existNode);
                }
              }
            });
          });

          if (nextGenNodes.length === 0) {
            break;
          }

          nodes.push(nextGenNodes);
          i++;
        }

        return nodes;
      };

      const nodesByGeneration = getNodes(data);
      const nodes = nodesByGeneration.flatMap((gen, genIndex) =>
        gen.map(
          (item, index): Node =>
            genIndex === 0
              ? {
                  id: `${item.routineJobId}`,
                  type: 'input',
                  sourcePosition: Position.Right,
                  position: { x: 200 * genIndex + 50, y: 60 * index + 50 },
                  data: {
                    label: (
                      <NodeItem
                        job={
                          livePipeline
                            ? (livePipeline.routineJobs?.find(
                                (job) => job.routineJobId === item.routineJobId,
                              ) as JobElement)
                            : item
                        }
                      />
                    ),
                  },
                }
              : genIndex === nodesByGeneration.length - 1
              ? {
                  id: `${item.routineJobId}`,
                  type: 'output',
                  targetPosition: Position.Left,
                  position: { x: 200 * genIndex + 50, y: 60 * index + 50 },
                  data: {
                    label: (
                      <NodeItem
                        job={
                          livePipeline
                            ? (livePipeline.routineJobs?.find(
                                (job) => job.routineJobId === item.routineJobId,
                              ) as JobElement)
                            : item
                        }
                      />
                    ),
                  },
                }
              : {
                  id: `${item.routineJobId}`,
                  sourcePosition: Position.Right,
                  targetPosition: Position.Left,
                  position: { x: 200 * genIndex + 50, y: 60 * index + 50 },
                  data: {
                    label: (
                      <NodeItem
                        job={
                          livePipeline
                            ? (livePipeline.routineJobs?.find(
                                (job) => job.routineJobId === item.routineJobId,
                              ) as JobElement)
                            : item
                        }
                      />
                    ),
                  },
                },
        ),
      );
      setNodes(nodes);

      const edges: Edge[] = nodesByGeneration
        .flatMap((gen) =>
          gen.flatMap(
            (item) =>
              item.routineJobEdges?.map(
                (e): Edge => ({
                  id: `e-${e.routineJobId}-${e.parentRoutineJobId}`,
                  source: `${e.parentRoutineJobId}`,
                  target: `${e.routineJobId}`,
                }),
              ),
          ),
        )
        .filter((item) => !!item) as Edge[];
      setEdges(edges);
    }
  }, [data, livePipeline]);

  if (isLoading) {
    return (
      <div>
        <LoadingOutlined />
      </div>
    );
  }

  if (!data || error) {
    return (
      <ErrorBox
        title="Something went wrong"
        desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot find jobs information'}
      />
    );
  }

  return (
    <Box>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        zoomOnScroll={false}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesConnectable={false}
      >
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default JobFlowController;

const Box = styled.div`
  height: 300px;
  border-radius: 1rem;
  border: 1px solid ${(props) => props.theme.colors.gray2};
  overflow: hidden;

  /* react-flow css override */
  .react-flow {
    background-color: rgb(250, 250, 250) !important;
  }

  .react-flow__attribution > a {
    display: none;
  }

  .react-flow__node {
    width: 150px !important;
    padding: 0 !important;
  }
`;

const ItemBox = styled(Link)`
  display: flex;
  align-items: center;
  padding: 10px;

  p {
    display: -webkit-box;
    margin-left: 0.25rem;
    color: #000;
    width: 100px;
    line-height: 1.5;
    text-align: left;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }
`;
