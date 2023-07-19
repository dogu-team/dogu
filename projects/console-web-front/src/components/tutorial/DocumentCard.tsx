import { Card } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';

interface Props {
  url: string;
  title: string;
  description: string;
}

const DocumentCard = ({ url, title, description }: Props) => {
  return (
    <StyledLink href={url} target="_blank">
      <StyledCard title={title} bordered={false}>
        <p>{description}</p>
      </StyledCard>
    </StyledLink>
  );
};

export default DocumentCard;

const StyledLink = styled(Link)`
  display: inline-flex;
  width: 46%;
  margin: 2%;
`;

const StyledCard = styled(Card)`
  width: 100%;
  height: 100%;
  flex: 1;
  border: 1px solid transparent;

  &:hover {
    border: 1px solid ${(props) => props.theme.colorPrimary};
  }
`;
