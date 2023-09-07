import { StepSchema } from '@dogu-private/types';
import { Checkbox, Input } from 'antd';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../../../styles/box';
import { CHECKOUT_ACTION_NAME, PREPARE_ACTION_NAME, RUN_TEST_ACTION_NAME } from '../../../../types/routine';

interface CheckoutProps {
  step: StepSchema;
  updateArgs: (args: StepSchema['with']) => void;
}

const CheckoutActionArgumentContainer = ({ step, updateArgs }: CheckoutProps) => {
  return (
    <>
      <KeyValueWrapper>
        <Checkbox checked={(step.with?.clean as boolean | undefined) ?? false} onChange={(e) => updateArgs({ clean: e.target.checked })}>
          <Key>clean</Key>
        </Checkbox>
      </KeyValueWrapper>
      {/* <KeyValueWrapper>
        <Key>tagOrBranch</Key>:&nbsp;
        <Value>{(step.with?.tagOrBranch as string | undefined) ?? 'default'}</Value>
      </KeyValueWrapper> */}
    </>
  );
};

interface Props {
  step: StepSchema;
  onUpdate: (stepWith: StepSchema['with']) => void;
}

const StepActionArgumentContainer = ({ step, onUpdate }: Props) => {
  const handleUpdateArgs = (partialWith: StepSchema['with']) => {
    onUpdate({ ...step.with, ...partialWith });
  };

  if (step.uses === undefined) {
    return null;
  }

  if (step.uses === CHECKOUT_ACTION_NAME) {
    return (
      <Box>
        <CheckoutActionArgumentContainer step={step} updateArgs={handleUpdateArgs} />
      </Box>
    );
  }

  if (step.uses === PREPARE_ACTION_NAME) {
    return (
      <Box>
        <KeyValueWrapper>
          <Checkbox
            checked={(step.with?.checkout as boolean | undefined) ?? false}
            onChange={(e) => {
              const value = e.target.checked;
              if (!value) {
                handleUpdateArgs({ checkout: value, clean: undefined, tagOrBranch: undefined });
              } else {
                handleUpdateArgs({ checkout: value });
              }
            }}
          >
            <Key>checkout</Key>
          </Checkbox>
        </KeyValueWrapper>
        {!!step.with?.checkout && <CheckoutActionArgumentContainer step={step} updateArgs={handleUpdateArgs} />}
        {/* <KeyValueWrapper>
          <Key>appVersion</Key>:&nbsp;
          <Value></Value>
        </KeyValueWrapper> */}
      </Box>
    );
  }

  if (step.uses === RUN_TEST_ACTION_NAME) {
    return (
      <Box>
        <KeyValueWrapper>
          <Checkbox
            checked={(step.with?.checkout as boolean | undefined) ?? false}
            onChange={(e) => {
              const value = e.target.checked;
              if (!value) {
                handleUpdateArgs({ checkout: value, clean: undefined, tagOrBranch: undefined });
              } else {
                handleUpdateArgs({ checkout: value });
              }
            }}
          >
            <Key>checkout</Key>
          </Checkbox>
        </KeyValueWrapper>
        {!!step.with?.checkout && <CheckoutActionArgumentContainer step={step} updateArgs={handleUpdateArgs} />}
        <KeyValueWrapper style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Key>command</Key>
          <Input.TextArea
            style={{ marginTop: '.25rem' }}
            value={step.with?.command as string | undefined}
            placeholder={`npm install
npm run ...
-----or-----
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest ...`}
            autoSize
            onChange={(e) => {
              handleUpdateArgs({
                command: `${e.target.value}`,
              });
            }}
          />
        </KeyValueWrapper>
      </Box>
    );
  }

  if (step.with) {
    return (
      <Box>
        {Object.entries(step.with).map(([key, value]) => {
          return (
            <KeyValueWrapper key={key}>
              <Key>{key}</Key>:&nbsp;
              <Value>{`${value as any}`}</Value>
            </KeyValueWrapper>
          );
        })}
      </Box>
    );
  }

  return <div></div>;
};

export default StepActionArgumentContainer;

const KeyValueWrapper = styled.div`
  ${flexRowBaseStyle}
  font-size: .8rem;
  line-height: 1.5;
  user-select: text;
`;

const Key = styled.span`
  font-weight: 600;
  font-size: 0.8rem;
  color: #000;
`;

const Value = styled.code`
  font-family: monospace;
  white-space: pre-wrap;
`;

const Box = styled.div`
  & > * {
    margin-bottom: 0.25rem;
  }

  & > *:last-child {
    margin-bottom: 0;
  }
`;
