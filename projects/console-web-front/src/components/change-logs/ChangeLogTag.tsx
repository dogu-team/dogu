import { ChangeLogType } from '@dogu-private/types';
import styled from 'styled-components';

import { flexRowCenteredStyle } from '../../styles/box';

export type AnnouncementType =
  | 'announcement'
  | 'feature'
  | 'event'
  | 'release'
  | 'web'
  | 'mobile'
  | 'game'
  | 'automation'
  | 'integration';

interface Props {
  type: ChangeLogType;
}

const ChnageLogTag = ({ type }: Props) => {
  switch (type) {
    case ChangeLogType.ANNOUNCEMENT:
      return <Tag tagColor="#6f95ed">Announcement</Tag>;
    case ChangeLogType.FEATURE:
      return <Tag tagColor="#7eed6f">Feature</Tag>;
    case ChangeLogType.EVENT:
      return <Tag tagColor="#d8a5f6">Event</Tag>;
    case ChangeLogType.RELEASE:
      return <Tag tagColor="#e6b472">Release</Tag>;
    case ChangeLogType.WEB:
      return <Tag tagColor="#afe5e7">Web</Tag>;
    case ChangeLogType.MOBILE:
      return <Tag tagColor="#dbdc89">Mobile</Tag>;
    case ChangeLogType.GAME:
      return <Tag tagColor="#f59beb">Game</Tag>;
    case ChangeLogType.AUTOMATION:
      return <Tag tagColor="#a2f2b3">Automation</Tag>;
    case ChangeLogType.INTEGRATION:
      return <Tag tagColor="#73b733">Integration</Tag>;
    default:
      return null;
  }
};

export default ChnageLogTag;

const Tag = styled.div<{ tagColor: string }>`
  position: relative;
  ${flexRowCenteredStyle}
  padding: .15rem .4rem .15rem .75rem;
  font-size: 0.7rem;
  font-weight: 400;

  &:before {
    content: '';
    position: absolute;
    left: 0.15rem;
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background-color: ${(props) => props.tagColor};
  }
`;
