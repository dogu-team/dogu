import { Select, SelectProps, Tag } from 'antd';
import styled from 'styled-components';
import { CHECKOUT_ACTION_NAME, PREPARE_ACTION_NAME, RUN_TEST_ACTION_NAME } from '../../../../types/routine';

const ActionSelector = (props: SelectProps) => {
  const actions: SelectProps<string>['options'] = [
    {
      label: (
        <OptionBox>
          <b>
            Run test
            <Tag style={{ marginLeft: '.25rem' }} color="success">
              Recommended
            </Tag>
          </b>
          <p>Install and run application or browser and run test scripts. This action contains checkout, and prepare actions.</p>
        </OptionBox>
      ),
      title: 'Run test',
      value: RUN_TEST_ACTION_NAME,
    },
    {
      label: (
        <OptionBox>
          <b>Checkout</b>
          <p>Checkout git repository from integrated remote repository.</p>
        </OptionBox>
      ),
      title: 'Checkout',
      value: CHECKOUT_ACTION_NAME,
    },
    {
      label: (
        <OptionBox>
          <b>Prepare</b>
          <p>Install application and run it. This action contains checkout and doesn&apos;t run test script.</p>
        </OptionBox>
      ),
      title: 'Prepare',
      value: PREPARE_ACTION_NAME,
    },
  ];

  return <Select {...props} options={actions} dropdownMatchSelectWidth={false} />;
};

export default ActionSelector;

const OptionBox = styled.div`
  width: 250px;
  line-height: 1.5;

  b {
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  p {
    font-size: 0.75rem;
    white-space: pre-wrap;
  }
`;
