import Link from 'next/link';
import styled from 'styled-components';

interface Props {
  items: { id: string; title: string }[];
}

const GuideAnchor = ({ items }: Props) => {
  return (
    <ItemBox>
      {items.map((item) => (
        <Item key={item.id}>
          <StyledLink href={`#${item.id}`}>{item.title}</StyledLink>
        </Item>
      ))}
    </ItemBox>
  );
};

export default GuideAnchor;

const ItemBox = styled.ol``;

const Item = styled.li`
  list-style-type: none;
  counter-increment: list;
  position: relative;
  padding-left: 1.25em;

  &::after {
    content: counter(list) '.';
    position: absolute;
    left: -1em;
    top: 0.25em;
    width: 2em;
    text-align: right;
    font-size: .85rem;
    color: ${(props) => props.theme.main.colors.gray3}};
  }
`;

const StyledLink = styled(Link)`
  display: block;
  padding: 0.25rem 0;
  color: ${(props) => props.theme.main.colors.gray3};
  text-decoration: none;
  font-size: 0.85rem;
`;
