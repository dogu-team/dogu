import { ArrowLeftOutlined } from '@ant-design/icons';
import { RemoteBase } from '@dogu-private/console';
import { List } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../styles/box';
import PlatformIcon from '../device/PlatformIcon';
import RemoteJobStateIcon from './RemoteJobStateIcon';

interface Props {
  remote: RemoteBase;
}

const RemoteSidebar = ({ remote }: Props) => {
  const router = useRouter();
  const selectedDeviceJobId = router.query.jobId as string | undefined;

  return (
    <Box>
      <HeadBox>
        <Link href={`/dashboard/${router.query.orgId}/projects/${router.query.pid}/remotes`}>
          <ArrowLeftOutlined /> Back
        </Link>
      </HeadBox>

      <div>
        <Title>Devices</Title>

        <List
          dataSource={remote.remoteDeviceJobs}
          renderItem={(item, index) => {
            if (!item.device) {
              return null;
            }

            const isSelected = selectedDeviceJobId ? selectedDeviceJobId === item.remoteDeviceJobId : index === 0;

            return (
              <ItemBox
                isSelected={isSelected}
                onClick={() => {
                  if (isSelected) {
                    return;
                  }

                  router.push(
                    {
                      query: {
                        ...router.query,
                        jobId: item.remoteDeviceJobId,
                      },
                    },
                    undefined,
                    { shallow: true },
                  );
                }}
              >
                <FlexRow style={{ alignItems: 'flex-start' }}>
                  <div style={{ marginRight: '.5rem' }}>
                    <RemoteJobStateIcon state={item.state} />
                  </div>
                  <div style={{ marginTop: '.25rem' }}>
                    <FlexRow style={{ alignItems: 'flex-start' }}>
                      <PlatformIcon platform={item.device.platform} />
                      <p style={{ fontSize: '.85rem', fontWeight: '500', marginLeft: '.25rem' }}>{item.device.name}</p>
                    </FlexRow>
                    <div style={{ marginTop: '.25rem' }}>
                      <div style={{ fontSize: '.75rem' }}>{item.device.modelName ? `${item.device.modelName} (${item.device.model})` : item.device.model}</div>
                    </div>
                  </div>
                </FlexRow>
              </ItemBox>
            );
          }}
          rowKey={(item) => `remote-device-job-${item.remoteDeviceJobId}`}
        />
      </div>
    </Box>
  );
};

export default RemoteSidebar;

const Box = styled.div`
  height: 100%;
  line-height: 1.5;
  overflow-y: auto;
`;

const HeadBox = styled.div`
  margin-bottom: 1rem;
`;

const ItemBox = styled(List.Item)<{ isSelected: boolean }>`
  position: relative;
  background-color: ${(props) => (props.isSelected ? `${props.theme.colorPrimary}44` : '#ffffff')};
  cursor: pointer;
  padding: 0.5rem 1rem !important;
  border-radius: 4px;
  user-select: none;

  &:hover {
    background-color: ${(props) => `${props.theme.colorPrimary}44`};
  }
`;

const Title = styled.p`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.gray6};
  margin-bottom: 0.5rem;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
