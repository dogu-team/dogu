import { PageBase, RemoteBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { List } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RiRemoteControlLine } from 'react-icons/ri';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api/index';
import useRefresh from '../../hooks/useRefresh';
import ListEmpty from '../common/boxes/ListEmpty';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  renderItem: (item: RemoteBase) => React.ReactNode;
  emptyText?: React.ReactNode;
  disablePagination?: boolean;
}

const RemoteListController = ({ organizationId, projectId, renderItem, emptyText, disablePagination }: Props) => {
  const router = useRouter();
  const { page } = router.query;
  const { data, isLoading, error, mutate } = useSWR<PageBase<RemoteBase>>(
    `/organizations/${organizationId}/projects/${projectId}/remotes?page=${Number(page) || 1}&offset=10`,
    swrAuthFetcher,
  );

  useRefresh(['onRefreshClicked'], () => mutate());

  return (
    <div>
      <List<RemoteBase>
        dataSource={data?.items}
        renderItem={renderItem}
        loading={isLoading}
        rowKey={(item) => `remote-${item.remoteId}`}
        pagination={
          disablePagination
            ? false
            : {
                defaultCurrent: 1,
                pageSize: 10,
                current: Number(page) || 1,
                onChange: (p) => {
                  scrollTo(0, 0);
                  router.push({
                    pathname: router.pathname,
                    query: {
                      orgId: organizationId,
                      pid: projectId,
                      page: p,
                    },
                  });
                },
                total: data?.totalCount,
              }
        }
        locale={{
          emptyText: emptyText ?? (
            <ListEmpty
              image={<RiRemoteControlLine style={{ fontSize: '90px' }} />}
              description={
                <p>
                  No remote test results. Please refer to <Link href={`/dashboard/${organizationId}/projects/${projectId}/get-started`}>tutorial</Link> for remote testing.
                </p>
              }
            />
          ),
        }}
      />
    </div>
  );
};

export default RemoteListController;
