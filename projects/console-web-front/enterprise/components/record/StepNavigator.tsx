import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, InputNumber } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useEventStore from '../../../src/stores/events';

import { flexRowCenteredStyle } from '../../../src/styles/box';

interface Props {
  currentStepIndex: number;
  totalStepCount: number;
  onCurrentStepIndexChanged: (index: number) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

const StepNavigator = ({
  currentStepIndex,
  totalStepCount,
  onCurrentStepIndexChanged,
  onPrevStep,
  onNextStep,
}: Props) => {
  const [value, setValue] = useState(currentStepIndex);

  useEffect(() => {
    setValue(currentStepIndex);
  }, [currentStepIndex]);

  return (
    <FlexRow>
      <ArrowButton
        icon={<LeftOutlined />}
        type="ghost"
        style={{ marginRight: '.25rem' }}
        onClick={() => {
          onPrevStep();
          setValue(currentStepIndex - 1);
        }}
        disabled={currentStepIndex < 2}
      />
      <FlexRow>
        <StyledInput
          type="number"
          defaultValue={currentStepIndex}
          value={value}
          onChange={(v) => {
            if (v > totalStepCount) {
              setValue(totalStepCount);
            }

            if (v < 1) {
              setValue(1);
            }

            if (v >= 1 && v <= totalStepCount) {
              setValue(v);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (isNaN(Number(e.currentTarget.value))) {
                return;
              }

              const count = Number(e.currentTarget.value);

              if (count < 1 || count > totalStepCount) {
                return;
              }

              onCurrentStepIndexChanged?.(count);
            }
          }}
        />
        <span style={{ margin: '0 .5rem' }}>/</span>
        <span>{totalStepCount}</span>
      </FlexRow>
      <ArrowButton
        icon={<RightOutlined />}
        type="ghost"
        style={{ marginLeft: '.25rem' }}
        disabled={currentStepIndex === totalStepCount}
        onClick={() => {
          onNextStep();
          setValue(currentStepIndex + 1);
        }}
      />
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

const ArrowButton = styled(Button)`
  &:disabled {
    opacity: 0;
    cursor: default;
  }
`;
