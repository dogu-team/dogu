import styled from 'styled-components';

import { InspectNode, InspectNodeAttributes } from '../../types/inspector';
import InspectObjectProperty from './InspectObjectProperty';

interface Props {
  node: InspectNode<InspectNodeAttributes> | undefined;
}

const NativeObjectDetail = ({ node }: Props) => {
  return (
    <Box>
      <Section>
        <StyledTitle>Attributes</StyledTitle>
        {!!node &&
          Object.keys(node.attributes).map((key) => {
            const value = node.attributes[key as keyof typeof node.attributes];
            if (typeof value === 'boolean') {
              return null;
            }

            if (typeof value !== 'object') {
              return <InspectObjectProperty key={key} title={key} values={value} />;
            }
          })}
      </Section>
    </Box>
  );
};

export default NativeObjectDetail;

const Box = styled.div`
  height: 100%;
  border-top: 1px solid ${(props) => props.theme.main.colors.gray6};
  padding: 0.5rem 0;
  font-size: 0.75rem;
`;

const Section = styled.div`
  padding-bottom: 0.5rem;
`;

const StyledTitle = styled.p`
  color: ${(props) => props.theme.main.colors.gray3};
  margin-bottom: 0.2rem;
  font-size: 0.9rem;
`;
