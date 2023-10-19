import { Select, SelectProps } from 'antd';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';

interface Props {
  contexts: string[];
  selectedContext?: string;
  onContextChange: (context: string) => void;
}

const InspectorContextMenu = ({ contexts, selectedContext, onContextChange }: Props) => {
  const options: SelectProps<string>['options'] = contexts.map((context) => ({
    label: context,
    value: context,
  }));

  return (
    <Box>
      <Title>Context:</Title>
      <Select<string>
        options={options}
        value={selectedContext}
        onChange={onContextChange}
        placeholder="Select context..."
        dropdownMatchSelectWidth={false}
        access-id="context-select"
      />
    </Box>
  );
};

export default InspectorContextMenu;

const Box = styled.div`
  ${flexRowBaseStyle}
  margin: .5rem 0;
`;

const Title = styled.p`
  font-size: 0.9rem;
  margin-right: 0.5rem;
`;
