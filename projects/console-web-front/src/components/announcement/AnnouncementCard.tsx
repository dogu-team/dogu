import { Card, Divider } from 'antd';
import styled from 'styled-components';
import ActionBar from './ActionBar';

import AnnouncementTag, { AnnouncementType } from './AnnouncementTag';

interface Props {
  tags: AnnouncementType[];
  title: string;
  article: React.ReactNode;
}

const AnnouncementCard = ({ tags, title, article }: Props) => {
  return (
    <StyledCard bordered={false}>
      <TitleWrapper>
        <TagWrapper>
          {tags.map((tag) => (
            <AnnouncementTag key={tag} type={tag} />
          ))}
        </TagWrapper>
        <div>
          <Title>{title}</Title>
        </div>
      </TitleWrapper>
      <Article>{article}</Article>
      <Divider />
      <ActionBar />
    </StyledCard>
  );
};

export default AnnouncementCard;

const StyledCard = styled(Card)`
  padding: 1rem;
  line-height: 1.5;

  .ant-card-body {
    padding: 0;
  }
`;

const TitleWrapper = styled.div`
  margin-bottom: 1rem;
`;

const TagWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
`;

const Title = styled.h5`
  font-size: 1rem;
  font-weight: 600;
`;

const Article = styled.article`
  font-size: 0.875rem;
`;
