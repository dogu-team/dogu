import { RightOutlined } from '@ant-design/icons';
import { Platform } from '@dogu-private/types';
import { Tooltip } from 'antd';
import { useRef } from 'react';
import styled from 'styled-components';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';

interface ToolbarButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  workingPlatforms?: Platform[];
  icon: React.ReactNode;
  text: React.ReactNode;
  content?: React.ReactNode;
  destroyTooltipOnHide?: boolean;
  tooltipTitle?: React.ReactNode;
  tooltipStyle?: React.CSSProperties;
}

const ToolbarButton = ({
  workingPlatforms,
  icon,
  text,
  content,
  destroyTooltipOnHide,
  tooltipStyle,
  tooltipTitle,
  ...props
}: ToolbarButtonProps) => {
  const { device } = useDeviceStreamingContext();
  const tooltipRef = useRef<HTMLDivElement>(null);

  if (!device || (workingPlatforms && !workingPlatforms.includes(device.platform))) {
    return null;
  }

  return (
    <Tooltip
      trigger="click"
      ref={tooltipRef}
      open={!!content ? undefined : false}
      placement="rightTop"
      title={
        <div style={{ color: '#000' }}>
          <p style={{ fontSize: '.8rem', fontWeight: '600', marginBottom: '.25rem', lineHeight: '1.5' }}>
            {tooltipTitle}
          </p>
          {content}
        </div>
      }
      color="#fff"
      destroyTooltipOnHide={destroyTooltipOnHide}
      overlayInnerStyle={tooltipStyle}
    >
      <StyledToolbarButton tabIndex={-1} {...props}>
        <SpaceBetween>
          <FlexBox style={{ marginRight: '.5rem' }}>
            <FlexBox style={{ marginRight: '.5rem' }}>{icon}</FlexBox>
            <p>{text}</p>
          </FlexBox>
          {!!content && (
            <FlexBox>
              <RightOutlined />
            </FlexBox>
          )}
        </SpaceBetween>
      </StyledToolbarButton>
    </Tooltip>
  );
};

export default ToolbarButton;

const StyledToolbarButton = styled.button`
  display: flex;
  width: 100%;
  height: 3rem;
  padding: 0 1rem;
  background-color: #fff;
  align-items: center;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray2};
  }

  p {
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const FlexBox = styled.div`
  ${flexRowBaseStyle}
`;

const SpaceBetween = styled.div`
  width: 100%;
  ${flexRowSpaceBetweenStyle}
`;
