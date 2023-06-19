import { CloseCircleFilled, PlusOutlined } from '@ant-design/icons';
import { ProjectRoleId } from '@dogu-private/types';
import { OrganizationId } from '@dogu-private/types';
import { Button } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import PermissionSelector from './PermissionSelector';

interface Props {
  profile: React.ReactNode;
  onAddClick: (roleId: number) => Promise<void>;
  organizationId: OrganizationId;
  defaultRoleId?: ProjectRoleId;
  isJoined: boolean;
}

const AddMemberWithRoleItem = ({ profile, onAddClick, organizationId, defaultRoleId, isJoined }: Props) => {
  const [role, setRole] = useState<ProjectRoleId | undefined>(defaultRoleId);
  const [loading, setLoading] = useState(false);

  const handleClickAdd = async () => {
    if (!role) {
      return;
    }

    setLoading(true);
    await onAddClick(role);
    setLoading(false);
  };

  return (
    <TeamIteamBox>
      <div>{profile}</div>
      {isJoined ? (
        <p>Already joined</p>
      ) : (
        <SelectWrapper>
          <PermissionSelector organizationId={organizationId} onSelectRole={setRole} defaultRoleId={defaultRoleId} />
          {role && (
            <>
              <StyledButton type="primary" icon={<PlusOutlined />} onClick={handleClickAdd} loading={loading} />
              <Undo onClick={() => setRole(undefined)}>
                <CloseCircleFilled style={{ fontSize: '0.8rem' }} />
              </Undo>
            </>
          )}
        </SelectWrapper>
      )}
    </TeamIteamBox>
  );
};

export default AddMemberWithRoleItem;

const TeamIteamBox = styled.div`
  margin: 0.25rem 0;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${(props) => props.theme.colors.gray3};
  border-radius: 8px;
`;

const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StyledButton = styled(Button)`
  margin: 0 0.25rem;
`;

const Undo = styled.button`
  padding: 0.25rem;
  background-color: #fff;
  color: ${(props) => props.theme.colors.gray4};
`;
