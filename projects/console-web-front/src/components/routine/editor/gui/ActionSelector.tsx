import { Select, SelectProps } from 'antd';
import { PREPARE_ACTION_NAME, RUN_TEST_ACTION_NAME } from '../../../../types/routine';

const ActionSelector = (props: SelectProps) => {
  const actions: SelectProps<string>['options'] = [
    {
      label: 'Install and run app',
      value: PREPARE_ACTION_NAME,
    },
    { label: 'Run test', value: RUN_TEST_ACTION_NAME },
  ];

  return <Select {...props} options={actions} />;
};

export default ActionSelector;
