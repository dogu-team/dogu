import Trans from 'next-translate/Trans';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../styles/box';

interface Props {
  banner: React.ReactNode;
  titleKey: string;
  option: React.ReactNode;
}

const TitleWithBannerAndOption: React.FC<Props> = ({ banner, titleKey, option }) => {
  return (
    <div style={{ marginBottom: '.5rem' }}>
      <FlexRow>
        <StyledH4>
          <Trans i18nKey={titleKey} />
        </StyledH4>
        {banner}
      </FlexRow>

      <div style={{ marginTop: '.25rem' }}>{option}</div>
    </div>
  );
};

export default TitleWithBannerAndOption;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const StyledH4 = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
`;
