import { PageBase, RecordTestCaseBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { List } from 'antd';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../api';
import ListEmpty from '../../../components/common/boxes/ListEmpty';
import useRefresh from '../../../hooks/useRefresh';
import { flexRowBaseStyle, listItemStyle, tableHeaderStyle } from '../../../styles/box';

interface ItemProps {
  recordCase: RecordTestCaseBase;
}

const CaseItem = ({ recordCase }: ItemProps) => {
  return (
    <Item>
      <ItemInner>
        <TwoSpan>{recordCase.name}</TwoSpan>
        <TwoSpan>{recordCase.packageName}</TwoSpan>
        <OneSpan></OneSpan>
      </ItemInner>
    </Item>
  );
};

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const CaseListController = ({ organizationId, projectId }: Props) => {
  const router = useRouter();
  const page = Number(router.query.page) || 1;
  const { data, isLoading, error, mutate } = useSWR<PageBase<RecordTestCaseBase>>(
    `/organizations/${organizationId}/projects/${projectId}/record-test-cases?page=${page}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );

  useRefresh(['onRefreshClicked'], () => mutate());

  return (
    <>
      <Header>
        <ItemInner>
          <TwoSpan>Name</TwoSpan>
          <TwoSpan>Application</TwoSpan>
          <OneSpan></OneSpan>
        </ItemInner>
      </Header>
      <List<RecordTestCaseBase>
        dataSource={data?.items}
        loading={isLoading}
        rowKey={(item) => `record-case-${item.recordTestCaseId}`}
        locale={{
          emptyText: <ListEmpty image={null} description={<p>~~~~~~~</p>} />,
        }}
        renderItem={(item) => <CaseItem recordCase={item} />}
        pagination={{
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
        }}
      />
    </>
  );
};

export default CaseListController;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const ItemInner = styled.div`
  ${flexRowBaseStyle}

  & > *:last-child {
    margin-right: 0;
  }
`;

const Cell = styled.div`
  margin-right: 1rem;
`;

const TwoSpan = styled(Cell)`
  flex: 2;
`;

const OneSpan = styled(Cell)`
  flex: 1;
`;
