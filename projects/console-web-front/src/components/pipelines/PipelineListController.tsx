import { CalendarOutlined, FieldTimeOutlined, GatewayOutlined, LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { PageBase, RoutinePipelineBase } from '@dogu-private/console';
import { OrganizationId, PIPELINE_STATUS, ProjectId } from '@dogu-private/types';
import { Button, List } from 'antd';
import { isAxiosError } from 'axios';
import Trans from 'next-translate/Trans';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BsRecord2Fill } from 'react-icons/bs';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useRefresh from '../../hooks/useRefresh';
import usePipelineFilterStore from '../../stores/pipeline-filter';
import { listItemStyle } from '../../styles/box';
import { menuItemButtonStyles } from '../../styles/button';
import { listActiveNameStyle } from '../../styles/text';
import { localizeDate } from '../../utils/date';
import { getErrorMessageFromAxios } from '../../utils/error';
import ErrorBox from '../common/boxes/ErrorBox';
import ListEmpty from '../common/boxes/ListEmpty';
import PipelineCreatedTimer from './PipelineCreatedTimer';
import PipelineRuntime from './PipelineRuntime';
import PipelineStatusIcon from './PipelineStatusIcon';

interface ItemProps {
  pipeline: RoutinePipelineBase;
}

const PipelineItem = ({ pipeline }: ItemProps) => {
  const router = useRouter();

  return (
    <ListItem key={`pipeline-${pipeline.routinePipelineId}`}>
      <ListItemInner>
        <Content>
          <IconWrapper>
            <PipelineStatusIcon status={pipeline.status} />
          </IconWrapper>
          <div>
            <Link href={`/dashboard/${router.query.orgId}/projects/${router.query.pid}/routines/${pipeline.routinePipelineId}`}>
              <Name>
                {`${pipeline.routine?.name}`}&nbsp;
                <b>#{pipeline.index}</b>
              </Name>
            </Link>
            {pipeline.creator && (
              <Description>
                <UserOutlined style={{ marginRight: '.25rem' }} />
                {pipeline.creator.name}
              </Description>
            )}
          </div>
        </Content>
        <Content style={{ justifyContent: 'flex-end' }}>
          {pipeline.status === PIPELINE_STATUS.IN_PROGRESS && (
            <div style={{ marginRight: '1rem' }}>
              <Link href={`/dashboard/${router.query.orgId}/projects/${router.query.pid}/routines/${pipeline.routinePipelineId}/devices`}>
                <Button style={{ display: 'flex', alignItems: 'center' }} size="small" icon={<BsRecord2Fill style={{ color: 'red' }} />} type="primary">
                  &nbsp;Live
                </Button>
              </Link>
            </div>
          )}
          <DateContainer>
            <DateBox>
              <CalendarOutlined style={{ fontSize: '1rem', marginRight: '.2rem' }} />
              <PipelineCreatedTimer createdAt={localizeDate(new Date(pipeline.createdAt))} />
            </DateBox>
            <DateBox>
              <FieldTimeOutlined style={{ fontSize: '1rem', marginRight: '.2rem' }} />
              <PipelineRuntime
                status={pipeline.status}
                startedAt={pipeline.inProgressAt && new Date(pipeline.inProgressAt)}
                endedAt={pipeline.completedAt && new Date(pipeline.completedAt)}
              />
            </DateBox>
          </DateContainer>
        </Content>
      </ListItemInner>
    </ListItem>
  );
};

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const PipelineListController = ({ organizationId, projectId }: Props) => {
  const router = useRouter();
  const page = router.query.page;
  const routine = router.query.routine;
  const { status } = usePipelineFilterStore((state) => state.filterValue);
  const { data, isLoading, error, mutate } = useSWR<PageBase<RoutinePipelineBase>>(
    `/organizations/${organizationId}/projects/${projectId}/pipelines?routine=${routine ?? ''}&status=${status.join()}&page=${Number(page) || 1}&offset=10`,
    swrAuthFetcher,
  );

  useRefresh(['onRefreshClicked', 'onPipelineCreated'], () => mutate());

  if (!data && isLoading) {
    <LoadingBox>
      <LoadingOutlined style={{ fontSize: '3rem' }} />
    </LoadingBox>;
  }

  if (!data || error) {
    if (error) {
      return <ErrorBox title="Something went wrong" desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot find pipelines information'} />;
    }

    return null;
  }

  return (
    <Box>
      <List<RoutinePipelineBase>
        dataSource={data.items}
        renderItem={(item) => {
          return <PipelineItem pipeline={item} />;
        }}
        loading={isLoading}
        rowKey={(item) => `pipeline-${item.routinePipelineId}`}
        pagination={{
          defaultCurrent: 1,
          pageSize: 10,
          current: Number(page) || 1,
          onChange: (p) => {
            scrollTo(0, 0);
            router.push({
              pathname: router.pathname,
              query: routine
                ? { orgId: organizationId, pid: projectId, routine, page: p }
                : {
                    orgId: organizationId,
                    pid: projectId,
                    page: p,
                  },
            });
          },
          total: data.totalCount,
        }}
        locale={{
          emptyText: (
            <ListEmpty
              image={<GatewayOutlined style={{ fontSize: '90px' }} />}
              description={
                <Trans
                  i18nKey="routine:pipelineEmptyDescription"
                  components={{ br: <br />, link: <Link href="https://docs.dogutech.io/management/project/routine" target="_blank" /> }}
                />
              }
            />
          ),
        }}
      />
    </Box>
  );
};

export default PipelineListController;

const Box = styled.div``;

const ListItem = styled(List.Item)`
  ${listItemStyle}
`;

const ListItemInner = styled.div`
  display: flex;
  align-items: center;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const IconWrapper = styled.div`
  display: flex;
  width: 100px;
  margin-right: 0.5rem;
`;

const Name = styled.p`
  ${listActiveNameStyle}
  font-size: 1.05rem;
  line-height: 1.5;

  b {
    font-size: 0.9rem;
    font-weight: 500;
  }
`;

const Description = styled.p`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.gray6};
`;

const DateContainer = styled.div`
  width: 150px;
`;

const DateBox = styled.div`
  display: flex;
  margin: 0.25rem 0;
  font-size: 0.75rem;
  align-items: center;
  justify-content: flex-end;
`;

const LoadingBox = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RoutineNameBox = styled.div`
  width: 150px;
  margin-right: 1rem;
`;

const MenuItemButton = styled.button`
  ${menuItemButtonStyles}
`;
