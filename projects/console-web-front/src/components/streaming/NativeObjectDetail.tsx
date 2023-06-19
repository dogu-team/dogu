import styled from 'styled-components';
import { InspectNode } from '../../workers/native-ui-tree';

interface Props {
  node: InspectNode | undefined;
}

const NativeObjectDetail = ({ node }: Props) => {
  if (!node) {
    return <div>Select UI</div>;
  }

  return (
    <Box>
      <Section>
        <StyledTitle>Attributes</StyledTitle>
        {Object.keys(node.attributes).map((key) => {
          const value = node.attributes[key as keyof typeof node.attributes];
          if (typeof value === 'boolean') {
            return null;
          }

          if (typeof value !== 'object') {
            return (
              <div key={key}>
                <b style={{ fontWeight: '700', marginRight: '.25rem' }}>{key}</b>
                <span>{`${value}`}</span>
              </div>
            );
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
