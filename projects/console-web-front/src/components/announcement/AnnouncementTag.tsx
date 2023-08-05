import styled from 'styled-components';
import { flexRowCenteredStyle } from '../../styles/box';

export type AnnouncementType = 'announcement' | 'feature' | 'event' | 'release' | 'web' | 'mobile' | 'game' | 'automation' | 'integration';

interface Props {
  type: AnnouncementType;
}

const AnnouncementTag = ({ type }: Props) => {
  switch (type) {
    case 'announcement':
      return <Tag tagColor="#6f95ed">Announcement</Tag>;
    case 'feature':
      return <Tag tagColor="#7eed6f">Feature</Tag>;
    case 'event':
      return <Tag tagColor="#d8a5f6">Event</Tag>;
    case 'release':
      return <Tag tagColor="#e6b472">Release</Tag>;
    case 'web':
      return <Tag tagColor="#afe5e7">Web</Tag>;
    case 'mobile':
      return <Tag tagColor="#dbdc89">Mobile</Tag>;
    case 'game':
      return <Tag tagColor="#f59beb">Game</Tag>;
    case 'automation':
      return <Tag tagColor="#a2f2b3">Automation</Tag>;
    case 'integration':
      return <Tag tagColor="#73b733">Integration</Tag>;
    default:
      return null;
  }
};

export default AnnouncementTag;

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
