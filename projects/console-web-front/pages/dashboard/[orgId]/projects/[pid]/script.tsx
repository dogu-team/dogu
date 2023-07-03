import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { useEffect, useRef, useState } from 'react';
import Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import Head from 'next/head';
import { DeviceBase, RoutineDeviceJobBase, RoutinePipelineBase, ProjectApplicationBase, ProjectApplicationWithIcon } from '@dogu-private/console';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Button } from 'antd';
import { CaretRightOutlined, StopFilled } from '@ant-design/icons';
import { PIPELINE_STATUS } from '@dogu-private/types';
import Trans from 'next-translate/Trans';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import { NextPageWithLayout } from 'pages/_app';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import FileExplorer from 'src/components/explorer/FileExplorer';
import withProjectScript, { getProjectScriptPageServerSideProps, ProjectScriptServerSideProps, WithProjectScriptProps } from 'src/hoc/withProjectScript';
import { ExplorerNode } from 'src/components/explorer/type';
import FileViewer, { Context, IContext } from 'src/components/editor/viewer/Viewer';
import { GitlabIDEButton } from 'src/components/script/GitlabIDEButton';
import ResizableLayout from 'src/components/layouts/ResizableLayout';
import DeviceViewer from 'src/components/script/DeviceViewer';
import useResizePreference from '../../../../../src/hooks/useResizePreference';
import RunScriptMenu from '../../../../../src/components/script/RunScriptMenu';
import { cancelPipeline, runInstantTest } from '../../../../../src/api/routine';
import { sendErrorNotification, sendSuccessNotification } from '../../../../../src/utils/antd';
import { swrAuthFetcher } from '../../../../../src/api/index';
import { isPipelineInProgress } from '../../../../../src/utils/pipeline';
import useWebSocket from '../../../../../src/hooks/useWebSocket';
import useRequest from '../../../../../src/hooks/useRequest';
import useScriptHashRoute from '../../../../../src/hooks/script/useScriptHashRoute';
import { flexRowCenteredStyle } from '../../../../../src/styles/box';
import { getErrorMessage } from '../../../../../src/utils/error';
import { getFile } from '../../../../../src/api/repository';
import ProjectApplicationSelector from '../../../../../src/components/project-application/ProjectApplicationSelector';

const MAX_HISTORY_SIZE = 20;

const ScriptPage: NextPageWithLayout<WithProjectScriptProps> = ({ organization, project, repositoryFileMetaTree, explorerTree }) => {
  const router = useRouter();
  const { pipelineId, jobId, deviceJobId } = useScriptHashRoute();

  const [context, setContext] = useState<IContext>({
    nodeQueue: [],
    currentFile: {
      file_name: '',
      file_path: '',
      size: 0,
      encoding: '',
      content: '',
      content_sha256: '',
      ref: '',
      blob_id: '',
      commit_id: '',
      last_commit_id: '',
    },
    selectedNode: {
      type: 'dir',
      name: '',
      path: '',
    },
  });
  const [selectedDevice, setSelectedDevice] = useState<DeviceBase>();
  const [selectedApp, setSelectedApp] = useState<ProjectApplicationWithIcon>();
  const [isRunning, setIsRunning] = useState<boolean>(!!pipelineId);
  const [requestLoading, request] = useRequest(runInstantTest);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);
  const { initWidth: initFileTreeWidth, saveWidth: saveFileTreeWidth } = useResizePreference('project-script-file-tree-width', 200);
  const { initWidth: initEditorWidth, saveWidth: saveEditorWidth } = useResizePreference('project-script-editor-width', 500);
  const { t } = useTranslation();

  const {
    data: deviceJob,
    isLoading,
    error,
  } = useSWR<RoutineDeviceJobBase>(
    !!pipelineId &&
      !!jobId &&
      !!deviceJobId &&
      `/organizations/${organization.organizationId}/projects/${project.projectId}/pipelines/${pipelineId}/jobs/${jobId}/device-jobs/${deviceJobId}`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );

  const statusSocketRef = useWebSocket(
    !!pipelineId ? `/ws/live-pipeline-status?organization=${organization.organizationId}&project=${project.projectId}&pipeline=${pipelineId}` : null,
  );

  useEffect(() => {
    if (deviceJob) {
      setIsRunning(isPipelineInProgress(deviceJob.status) || deviceJob.status === PIPELINE_STATUS.CANCEL_REQUESTED);
    }

    return () => {
      setIsRunning(false);
    };
  }, [deviceJob]);

  useEffect(() => {
    if (deviceJob && statusSocketRef.current) {
      statusSocketRef.current.onmessage = (event) => {
        const parsedData: RoutinePipelineBase = JSON.parse(event.data);

        const djResult = parsedData?.routineJobs?.[0].routineDeviceJobs?.[0];
        if (djResult) {
          setIsRunning(isPipelineInProgress(djResult.status) || deviceJob.status === PIPELINE_STATUS.CANCEL_REQUESTED);
        }
      };

      return () => {
        if (statusSocketRef.current) {
          statusSocketRef.current.close();
        }
      };
    }
  }, [deviceJob?.routineDeviceJobId]);

  const searchFile = async (node: ExplorerNode) => {
    const { path } = node;

    for (const fileMeta of repositoryFileMetaTree) {
      if (fileMeta.path === path) {
        const file = await getFile(organization.organizationId, project.projectId, fileMeta.path);
        return file;
      }
    }
  };

  const onSelectNode = async (node: ExplorerNode) => {
    const load = async () => {
      const editor = editorRef.current;

      if (editor) {
        const file = await searchFile(node);
        if (!file) {
          return;
        }

        setContext((context) => {
          if (context.nodeQueue.length >= MAX_HISTORY_SIZE) {
            context.nodeQueue.shift();
          }
          return { nodeQueue: [...context.nodeQueue, node], currentFile: file, selectedNode: node };
        });
      }
    };

    await load();
  };

  const runTest = async () => {
    if (!selectedDevice) {
      return;
    }

    const currentFilePath = context.currentFile.file_path;

    if (!currentFilePath) {
      return;
    }

    try {
      const pipeline = await request(organization.organizationId, project.projectId, {
        deviceName: selectedDevice.name,
        scriptPath: currentFilePath,
        appVersion: selectedApp?.version,
      });
      router.replace(
        {
          pathname: router.pathname,
          query: router.query,
          hash: `${pipeline.routinePipelineId}:${pipeline.routineJobs?.[0].routineJobId}:${pipeline.routineJobs?.[0].routineDeviceJobs?.[0].routineDeviceJobId}`,
        },
        undefined,
        { shallow: true },
      );
      sendSuccessNotification(t('project-script:runTestSuccessMessage'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project-script:runTestFailureMessage', { reason: getErrorMessage(e) }));
      }
    }
  };

  const cancelTest = async () => {
    if (!pipelineId || !jobId || !deviceJobId) {
      return;
    }

    try {
      await cancelPipeline(organization.organizationId, project.projectId, Number(pipelineId));
      sendSuccessNotification(t('project-script:cancelTestSuccessMessage'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project-script:cancelTestFailureMessage', { reason: getErrorMessage(e) }));
      }
    }
  };

  return (
    <Context.Provider value={context}>
      <Head>
        <title>
          {context.nodeQueue.length === 0
            ? `Script test - ${project.name} | Dogu`
            : `${context.nodeQueue[context.nodeQueue.length - 1].path} at Script test - ${project.name} | Dogu`}
        </title>
      </Head>
      <Box>
        <ResizableLayout
          first={
            <FileExplorer
              organizationId={organization.organizationId}
              projectId={project.projectId}
              tree={explorerTree}
              selectedNode={context.selectedNode}
              onClick={onSelectNode}
            />
          }
          firstStyle={{ height: '100%' }}
          last={
            <ResizableLayout
              first={
                <EditorWrapper>
                  <FileViewer
                    height="100%"
                    width="100%"
                    editorRef={editorRef}
                    headerMenu={<GitlabIDEButton organizationId={organization.organizationId} projectId={project.projectId} path={context.currentFile.file_path} />}
                  />

                  {!context.currentFile.file_path && (
                    <SelectFileHintContainer>
                      <p>
                        <Trans
                          i18nKey="project-script:selectTestScriptHintText"
                          components={{ br: <br />, link: <Link href="https://docs.dogutech.io/organization-and-project/project/script-test" target="_blank" /> }}
                        />
                      </p>
                    </SelectFileHintContainer>
                  )}
                </EditorWrapper>
              }
              firstStyle={{ height: '100%' }}
              firstMinSize={100}
              firstMaxSize={1e6}
              last={
                <DeviceViewer
                  selectedDevice={selectedDevice}
                  menu={
                    <RunScriptMenu
                      project={project}
                      selectedApp={selectedApp}
                      selectedDevice={selectedDevice}
                      onSelectApp={setSelectedApp}
                      onSelectDevice={(device) => {
                        setSelectedDevice(device);
                        setSelectedApp(undefined);
                      }}
                      button={
                        isLoading ? null : isRunning ? (
                          <Button danger onClick={cancelTest}>
                            <StopFilled />
                            {t('project-script:stopButtonTitle')}
                          </Button>
                        ) : (
                          <Button disabled={isRunning || !selectedDevice || !context.currentFile.file_path} type="primary" onClick={runTest} loading={isLoading || requestLoading}>
                            <CaretRightOutlined />
                            {t('project-script:runButtonTitle')}
                          </Button>
                        )
                      }
                    />
                  }
                  isRunning={isRunning}
                />
              }
              lastStyle={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              initFirstSize={initEditorWidth}
              direction="horizontal"
              onResize={saveEditorWidth}
            />
          }
          firstMinSize={50}
          firstMaxSize={500}
          lastStyle={{ height: '100%' }}
          initFirstSize={initFileTreeWidth}
          direction="horizontal"
          onResize={saveFileTreeWidth}
        />
      </Box>
    </Context.Provider>
  );
};

ScriptPage.getLayout = (page) => {
  return <ProjectLayout>{page}</ProjectLayout>;
};

export const getServerSideProps: GetServerSideProps<ProjectScriptServerSideProps> = getProjectScriptPageServerSideProps;

export default withProjectScript(ScriptPage);

const Box = styled.div`
  height: calc(100vh - 57px - 13rem);
  overflow: hidden;
`;

const EditorWrapper = styled.div`
  position: relative;
  height: 100%;
`;

const SelectFileHintContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff88;
  ${flexRowCenteredStyle}

  p {
    text-align: center;
    line-height: 1.4;
  }
`;

const StyledProjectApplicationSelector = styled(ProjectApplicationSelector)`
  margin-left: 0.5rem;
  flex: 1;
  max-width: 20rem;
`;
