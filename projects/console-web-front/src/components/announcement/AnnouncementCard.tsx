import { ChangeLogBase } from '@dogu-private/console';
import { Card, Divider } from 'antd';
import styled from 'styled-components';

import { flexRowCenteredStyle } from '../../styles/box';
import ActionBar from './ActionBar';
import AnnouncementTag, { AnnouncementType } from './AnnouncementTag';

interface Props {
  tags: AnnouncementType[];
  changeLog: ChangeLogBase;
}

const AnnouncementCard = ({ tags, changeLog }: Props) => {
  return (
    <StyledCard bordered={false}>
      <TitleWrapper>
        <TagWrapper>
          {tags.map((tag) => (
            <AnnouncementTag key={tag} type={tag} />
          ))}
        </TagWrapper>
        <div>
          <Title>{changeLog.title}</Title>
        </div>
      </TitleWrapper>
      <Article>{changeLog.content}</Article>
      <Divider />
      <BarWrapper>
        <ActionBar changeLogId={changeLog.changeLogId} selectedReaction={changeLog.userReactions?.[0]?.reactionType} />
      </BarWrapper>
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

const BarWrapper = styled.div`
  ${flexRowCenteredStyle}
`;
