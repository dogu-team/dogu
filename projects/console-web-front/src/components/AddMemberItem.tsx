import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styled from 'styled-components';

interface Props {
  profile: React.ReactNode;
  onAddClick: () => Promise<void>;
  isJoined: boolean;
}

const AddMemberItem = ({ profile, onAddClick, isJoined }: Props) => {
  return (
    <MemberItem>
      {profile}

      <div>
        {isJoined ? (
          <p>Already joined</p>
        ) : (
          <Button icon={<PlusOutlined style={{ fontSize: '1.2rem' }} />} onClick={onAddClick} />
        )}
      </div>
    </MemberItem>
  );
};

export default AddMemberItem;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.25rem 0;
`;
