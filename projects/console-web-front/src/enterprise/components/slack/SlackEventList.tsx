import { Checkbox } from 'antd';

interface Props {
  defaultEvents?: string[];
  onSelect: (events: string[]) => void;
}

const SlackEventList = (props: Props) => {
  const options = [
    { label: 'On Success', value: 'on-success' },
    { label: 'On Failure', value: 'on-failure' },
  ];

  return (
    <Checkbox.Group
      defaultValue={props.defaultEvents}
      options={options}
      onChange={(events) => {
        props.onSelect(events as string[]);
      }}
    />
  );
};

export default SlackEventList;
