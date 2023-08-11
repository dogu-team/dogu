import { ChangeLogBase } from '@dogu-private/console';
import { Card, Divider } from 'antd';
import styled from 'styled-components';
import { ChangeLogType } from '@dogu-private/types';
const ReactMarkdown = await import('react-markdown').then((m) => m.default);
const remarkGfm = await import('remark-gfm').then((m) => m.default);

import { flexRowCenteredStyle } from '../../styles/box';
import ReactionButtonBar from './ReactionButtonBar';
import ChnageLogTag from './ChangeLogTag';

interface Props {
  changeLog: ChangeLogBase;
}

const ChangeLogCard = ({ changeLog }: Props) => {
  const replacedContent = changeLog.content.replace(/\\n/g, '\n');

  return (
    <StyledCard bordered={false}>
      <TitleWrapper>
        <TagWrapper>
          {changeLog.tags.split(',').map((tag) => (
            <ChnageLogTag key={tag} type={tag as ChangeLogType} />
          ))}
        </TagWrapper>
        <div>
          <Title>{changeLog.title}</Title>
        </div>
      </TitleWrapper>
      <Article>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: (props) => <a {...props} target="_blank" /> }}>
          {replacedContent}
        </ReactMarkdown>
      </Article>
      {process.env.NEXT_PUBLIC_ENV !== 'self-hosted' && (
        <>
          <Divider />
          <BarWrapper>
            <ReactionButtonBar changeLogId={changeLog.changeLogId} selectedReaction={changeLog.userReactions?.[0]?.reactionType} />
          </BarWrapper>
        </>
      )}
    </StyledCard>
  );
};

export default ChangeLogCard;

const StyledCard = styled(Card)`
  padding: 1rem;
  margin-bottom: 1rem;
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
  font-size: 1.1rem;
  font-weight: 600;
`;

const Article = styled.article`
  font-size: 0.875rem;

  /* style for markdown */
  h1 {
    font-size: 1.2rem;
    font-weight: 600;
  }

  h2 {
    font-size: 1.1rem;
    font-weight: 600;
  }

  h3 {
    font-size: 1rem;
    font-weight: 500;
  }

  h4 {
    font-size: 0.9rem;
    font-weight: 500;
  }

  p {
    font-size: 0.875rem;
  }

  /* list with style */
  ul {
    padding-left: 1rem;
  }

  li {
    font-size: 0.875rem;
    list-style: disc;
  }
`;

const BarWrapper = styled.div`
  ${flexRowCenteredStyle}
`;
