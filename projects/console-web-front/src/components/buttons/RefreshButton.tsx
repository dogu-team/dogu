import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

import useEventStore from 'src/stores/events';

interface Props {
  'access-id'?: string;
}

const RefreshButton = (props: Props) => {
  const [spin, setSpin] = useState(false);
  const fireEvent = useEventStore((state) => state.fireEvent);

  useEffect(() => {
    if (spin) {
      setTimeout(() => setSpin(false), 1000);
    }
  }, [spin]);

  return (
    <Button
      onClick={(e) => {
        setSpin(true);
        e.preventDefault();
        e.stopPropagation();
        fireEvent('onRefreshClicked');
      }}
      disabled={spin}
      icon={<StyledIcon spin={spin} />}
      {...props}
      access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'refresh-btn' : undefined}
    />
  );
};

export default RefreshButton;

const spin = keyframes`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
`;

const spinAnimation = css`
  ${spin} 1s;
`;

const StyledIcon = styled(ReloadOutlined)<{ spin: boolean }>`
  animation: ${(props) => (props.spin ? spinAnimation : 'none')};
`;
