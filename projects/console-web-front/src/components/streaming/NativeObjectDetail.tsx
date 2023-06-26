import styled from 'styled-components';

import { AndroidAttributeFields, InspectNode, InspectNodeAttributes, ScreenPosition } from '../../types/inspector';
import InspectObjectAttribute from './InspectObjectAttribute';

interface Props {
  node: InspectNode<InspectNodeAttributes> | undefined;
}

const NativeObjectDetail = ({ node }: Props) => {
  return (
    <Box>
      <Section>
        <StyledTitle>Attributes</StyledTitle>
        <div>
          <InspectObjectAttribute title="XPath" values={node?.attributes.path} />
          {!!node &&
            Object.keys(node.attributes).map((key) => {
              if (key === 'path') {
                return null;
              }

              const value = node.attributes[key as keyof typeof node.attributes];

              if ((key as AndroidAttributeFields) === 'bounds') {
                const pos = value as ScreenPosition | undefined;
                if (!pos) {
                  return null;
                }
                return <InspectObjectAttribute key={key} title={key} values={`[${pos.start[0]},${pos.start[1]}][${pos.end[0]},${pos.end[1]}]`} />;
              }

              return <InspectObjectAttribute key={key} title={key} values={`${value}`} />;
            })}
        </div>
      </Section>
    </Box>
  );
};

export default NativeObjectDetail;

const Box = styled.div`
  height: 100%;
  padding-bottom: 0.5rem;
  font-size: 0.75rem;
`;

const Section = styled.div`
  padding-bottom: 0.5rem;
`;

const StyledTitle = styled.p`
  position: sticky;
  top: 0;
  padding: 0.5rem 0;
  background-color: #fff;
  color: ${(props) => props.theme.main.colors.gray3};
  font-size: 0.9rem;
`;
