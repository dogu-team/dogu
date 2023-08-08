import { CaretLeftOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber } from 'antd';
import styled from 'styled-components';

import { flexRowCenteredStyle } from '../../../styles/box';

const StepNavigator = () => {
  return (
    <FlexRow>
      <Button icon={<LeftOutlined />} type="ghost" style={{ marginRight: '.25rem' }} />
      <FlexRow>
        <StyledInput type="number" value="1" />
        <span style={{ margin: '0 .5rem' }}>/</span>
        <span>100</span>
      </FlexRow>
      <Button icon={<RightOutlined />} type="ghost" style={{ marginLeft: '.25rem' }} />
    </FlexRow>
  );
};

export default StepNavigator;

const FlexRow = styled.div`
  ${flexRowCenteredStyle}
  font-size: 0.875rem;
`;

const StyledInput = styled(InputNumber)`
  width: 3rem;

  .ant-input-number-handler-wrap {
    display: none;
  }
`;
