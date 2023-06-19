import Link from 'next/link';
import styled from 'styled-components';

import H4 from 'src/components/common/headings/H4';

interface Props {
  title: string;
  desc: string;
  buttons: { text: string; link: string }[];
}

const HeaderDroppedItem = ({ title, desc, buttons }: Props) => {
  return (
    <Box>
      <LinkBox>
        {buttons.map((item) => (
          <StyledAnchor key={item.text} href={item.link}>
            {item.text}
          </StyledAnchor>
        ))}
      </LinkBox>
      <ContentBox>
        <TitleWrapper>
          <H4>{title}</H4>
        </TitleWrapper>
        <p style={{ lineHeight: '1.5em', fontSize: '1.1rem' }}>{desc}</p>
      </ContentBox>
    </Box>
  );
};

const Box = styled.div`
  padding: 3rem 12.5%;
  display: flex;
`;

const LinkBox = styled.div`
  width: 25%;
  padding-right: 5%;
  border-right: 1px solid ${(props) => props.theme.colors.gray5};
`;

const TitleWrapper = styled.div`
  margin-bottom: 1rem;
`;

const ContentBox = styled.div`
  padding-left: 5%;
`;

const StyledAnchor = styled(Link)`
  display: flex;
  padding: 0.5rem 0;
  color: ${(props) => props.theme.colors.black};
  font-size: 1.1rem;

  &:hover {
    color: ${(props) => props.theme.colorPrimary};
  }
`;

export default HeaderDroppedItem;
