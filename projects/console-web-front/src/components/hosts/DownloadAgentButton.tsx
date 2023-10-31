import { DownloadablePackageResult, DOWNLOAD_PLATFORMS } from '@dogu-private/types';
import { Button, ButtonProps, Tooltip } from 'antd';
import styled from 'styled-components';
import useSWR from 'swr';
import Image from 'next/image';

import { swrAuthFetcher } from '../../api';

interface ItemProps {
  item: DownloadablePackageResult;
}

const DownloadButton: React.FC<ItemProps> = ({ item }) => {
  const platfomText = {
    [DOWNLOAD_PLATFORMS.APPLE_ARM64]: 'Apple Silicon',
    [DOWNLOAD_PLATFORMS.APPLE_X86]: 'Apple Intel',
    [DOWNLOAD_PLATFORMS.WINDOWS]: 'Windows (x86_64)',
    [DOWNLOAD_PLATFORMS.UNDEFINED]: '',
  };

  const platformIcon = {
    [DOWNLOAD_PLATFORMS.APPLE_ARM64]: (
      <Image src={'/resources/icons/platforms/mac.svg'} width={20} height={20} alt="apple" />
    ),
    [DOWNLOAD_PLATFORMS.APPLE_X86]: (
      <Image src={'/resources/icons/platforms/mac.svg'} width={20} height={20} alt="apple" />
    ),
    [DOWNLOAD_PLATFORMS.WINDOWS]: (
      <Image src={'/resources/icons/platforms/windows.svg'} width={20} height={20} alt="apple" />
    ),
    [DOWNLOAD_PLATFORMS.UNDEFINED]: null,
  };

  return (
    <StyledButton
      onClick={async () => {
        window.open(item.url);
      }}
    >
      {platformIcon[item.platform]}
      &nbsp;{platfomText[item.platform]}
    </StyledButton>
  );
};

interface Props extends Omit<ButtonProps, 'onClick'> {}

const DownloadAgentButton: React.FC<Props> = ({ ...props }) => {
  const { data, isLoading } = useSWR<DownloadablePackageResult[]>(`/downloads/dogu-agent/latest`, swrAuthFetcher, {
    revalidateOnFocus: false,
  });

  return (
    <Tooltip
      title={
        <Box>
          {isLoading ? (
            <div>Loading...</div>
          ) : data && data.length > 0 ? (
            data?.map((item) => <DownloadButton key={item.name} item={item} />)
          ) : (
            <div>No item</div>
          )}
        </Box>
      }
      trigger="click"
      placement="bottom"
      color="#fff"
    >
      <Button {...props} />
    </Tooltip>
  );
};

export default DownloadAgentButton;

const Box = styled.div`
  min-width: 100px;
  min-height: 80px;
  color: #000;
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  background-color: #fff;
  border-radius: 0.25rem;

  &:hover {
    background-color: #f5f5f5;
  }
`;
