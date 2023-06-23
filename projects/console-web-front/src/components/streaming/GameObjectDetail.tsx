import { HitPoint } from '@dogu-tech/device-client-common';
import { Vector3 } from 'gamium/common';
import useTranslation from 'next-translate/useTranslation';
import styled, { css } from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { GamiumNodeAttributes, InspectNode } from '../../types/inspector';
import InspectObjectProperty from './InspectObjectProperty';

interface Props {
  node: InspectNode<GamiumNodeAttributes> | undefined;
  hitPoint: HitPoint | undefined;
}

const GameObjectDetail = ({ node, hitPoint }: Props) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Section>
        <StyledTitle>Hit Point</StyledTitle>
        {hitPoint ? (
          <FlexRow>
            <InspectObjectProperty title="" values={[{ label: 'X', value: hitPoint?.x.toFixed(1) }]} />
            <InspectObjectProperty title="" values={[{ label: 'Y', value: hitPoint?.y.toFixed(1) }]} />
            <InspectObjectProperty title="" values={[{ label: 'Z', value: hitPoint?.z.toFixed(1) }]} />
          </FlexRow>
        ) : (
          <div>No hit point</div>
        )}
      </Section>

      <Section>
        <StyledTitle>Properties</StyledTitle>
        {node ? (
          <div>
            {Object.entries(node.attributes).map(([key, value]) => {
              return (
                <InspectObjectProperty
                  key={key}
                  title={key}
                  values={
                    typeof value === 'object'
                      ? Object.entries(value).map(([k, v]) => ({
                          label: k,
                          value: v,
                        }))
                      : value
                  }
                />
              );
            })}
          </div>
        ) : (
          <FlexRow style={{ justifyContent: 'center' }}>{t('device-streaming:inspectorSelectObjectText')}</FlexRow>
        )}
      </Section>
    </Box>
  );
};

export default GameObjectDetail;

const Box = styled.div`
  height: 100%;
  border-top: 1px solid ${(props) => props.theme.main.colors.gray6};
  padding: 0.5rem 0;
  font-size: 0.75rem;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const StyledTitle = styled.p`
  color: ${(props) => props.theme.main.colors.gray3};
  margin-bottom: 0.2rem;
  font-size: 0.9rem;
`;

const Section = styled.div`
  padding-bottom: 0.5rem;
`;
