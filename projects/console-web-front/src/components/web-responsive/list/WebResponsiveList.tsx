import { TestExecutorBase } from '@dogu-private/console';
import { List, Modal } from 'antd';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../../styles/box';
import { useRouter } from 'next/router';

interface ItemProps {
  testExecutor: TestExecutorBase;
}

const WebResponsiveTableItem = ({ testExecutor }: ItemProps) => {
  const router = useRouter();

  const { testExecutorWebResponsives } = testExecutor;
  if (!testExecutorWebResponsives) {
    return null;
  }

  const getTotalSnapshotCount = () => {
    let totalSnapshotCount = 0;
    testExecutorWebResponsives.forEach((webResponsive) => {
      totalSnapshotCount += webResponsive.snapshotCount;
    });

    return totalSnapshotCount;
  };

  const getCondition = () => {
    const execution = testExecutor.execution;

    if (!execution || !execution.conditions) {
      return 'unknown';
    }

    const { conditions } = execution;
    const latestCondition = conditions[0];

    switch (latestCondition.state) {
      case 'CONDITION_SUCCEEDED':
        return 'success';
      case 'CONDITION_FAILED':
        return 'failure';
      case 'CONDITION_PENDING':
        return 'pending';
      default:
        return 'unknown';
    }
  };

  return (
    <Item
      key={`${testExecutor.testExecutorId}`}
      onClick={() => {
        router.push(`${router.asPath}/${testExecutor.testExecutorId}/viewer`);
      }}
    >
      <ItemInner>
        <URLCell>
          {testExecutorWebResponsives &&
            testExecutorWebResponsives.map((webResponsive) => {
              return <p key={webResponsive.url}>{webResponsive.url}</p>;
            })}
        </URLCell>
        <SnapshotCountCell>{getTotalSnapshotCount()}</SnapshotCountCell>
        <ConditionCell>{getCondition()}</ConditionCell>
      </ItemInner>
    </Item>
  );
};

interface Props {
  testExecutors: TestExecutorBase[];
}

const WebResponsiveTable = (props: Props) => {
  const { t } = useTranslation('web-responsive');

  return (
    <>
      <Header>
        <ItemInner>
          <URLCell>{t('webResponsiveUrlColumn')}</URLCell>
          <SnapshotCountCell>{t('webResponsiveSanpshotCount')}</SnapshotCountCell>
          <ConditionCell>Condition</ConditionCell>
          <ButtonWrapper />
        </ItemInner>
      </Header>
      <List<TestExecutorBase>
        loading={false}
        dataSource={props.testExecutors}
        renderItem={(webResponsive) => <WebResponsiveTableItem testExecutor={webResponsive} />}
        rowKey={(webResponsive) => webResponsive.testExecutorId}
        pagination={{
          current: 0,
          pageSize: 96,
          total: 0,
          // onChange: (page) => {
          //   updatePage(page);
          // },
        }}
      />
    </>
  );
};

export default WebResponsiveTable;

const URLCell = styled.div`
  ${tableCellStyle}
  flex: 5;
`;

const SnapshotCountCell = styled.div`
  ${tableCellStyle}
  flex: 1;
`;

const ConditionCell = styled.div`
  ${tableCellStyle}
  flex: 1;
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const ItemInner = styled.div`
  ${flexRowBaseStyle}
`;

const ButtonWrapper = styled.div`
  width: 100px;
  display: flex;
  justify-content: flex-end;
`;
