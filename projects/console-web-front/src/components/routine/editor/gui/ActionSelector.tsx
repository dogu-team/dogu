import { WarningFilled } from '@ant-design/icons';
import { Select, SelectProps, Tag } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

import { CHECKOUT_ACTION_NAME, PREPARE_ACTION_NAME, RUN_TEST_ACTION_NAME } from '../../../../types/routine';

const ActionSelector = (props: SelectProps) => {
  const { t } = useTranslation();

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
          <p>{t('routine:routineGuiEditorRunTestActionDescription')}</p>
        </OptionBox>
      ),
      title: 'Run test',
      value: RUN_TEST_ACTION_NAME,
    },
    {
      label: (
        <OptionBox>
          <b>Checkout</b>
          <p>{t('routine:routineGuiEditorCheckoutActionDescription')}</p>
        </OptionBox>
      ),
      title: 'Checkout',
      value: CHECKOUT_ACTION_NAME,
    },
    {
      label: (
        <OptionBox>
          <b>Prepare</b>
          <p>{t('routine:routineGuiEditorPrepareActionDescription')}</p>
        </OptionBox>
      ),
      title: 'Prepare',
      value: PREPARE_ACTION_NAME,
    },
  ];
  const isInvalid = !!props.value && !actions.find((action) => action.value === props.value);

  return (
    <Select
      {...props}
      options={actions}
      dropdownMatchSelectWidth={false}
      status={isInvalid ? 'warning' : undefined}
      suffixIcon={isInvalid ? <WarningFilled style={{ color: '#ffd666' }} /> : undefined}
    />
  );
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
