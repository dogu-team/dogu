import { CloseOutlined } from '@ant-design/icons';
import { ProjectRoleId } from '@dogu-private/types';
import { OrganizationId } from '@dogu-private/types';
import { Button, Empty } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';

import { flexRowSpaceBetweenStyle } from '../styles/box';
import PermissionRadioSelector from './PermissionRadioSelector';

interface Props<T> {
  input: React.ReactNode;
  searchResultItems: T[] | undefined;
  renderSearchResultItem: (item: T) => React.ReactNode;
  renderSelectedItem: (item: T) => React.ReactNode;
  itemKey: (item: T) => string;
  itemDisabled: (item: T) => boolean;
  onSubmit: (item: T, permission: ProjectRoleId) => Promise<void> | void;
  submitButtonText: string;
  loading: boolean;
  emptyDescription?: string;
  defaultPermission?: ProjectRoleId;
  onItemSelectEnd?: (item: T) => void;
  onItemUnselectEnd?: () => void;
}

function PermissionSelectContentBox<T>({
  input,
  searchResultItems,
  renderSearchResultItem,
  renderSelectedItem,
  itemKey,
  itemDisabled,
  onSubmit,
  submitButtonText,
  loading,
  emptyDescription,
  defaultPermission,
  onItemSelectEnd,
  onItemUnselectEnd,
}: Props<T>) {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const [selectedItem, setSelectedItem] = useState<T>();
  const [selectedPerm, setSelectedPerm] = useState<ProjectRoleId>(1);

  return !!selectedItem ? (
    <div>
      <SelectedItem>
        <div>{renderSelectedItem(selectedItem)}</div>
        <div>
          <CloseButton
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(undefined);
              onItemUnselectEnd?.();
            }}
          >
            <CloseOutlined />
          </CloseButton>
        </div>
      </SelectedItem>

      <MarginBox>
        <PermissionRadioSelector organizationId={orgId} onChange={setSelectedPerm} defaultRoleId={defaultPermission} />
      </MarginBox>

      <MarginBox>
        <Button
          type="primary"
          style={{ width: '100%' }}
          onClick={async () => {
            if (!selectedItem) {
              return;
            }

            await onSubmit(selectedItem, selectedPerm);
          }}
          loading={loading}
        >
          {submitButtonText}
        </Button>
      </MarginBox>
    </div>
  ) : (
    <MarginBox>
      {input}
      {searchResultItems &&
        (searchResultItems.length > 0 ? (
          <ListContainer>
            {searchResultItems.map((item) => (
              <Item
                key={itemKey(item)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem(item);
                  onItemSelectEnd?.(item);
                }}
                disabled={itemDisabled(item)}
              >
                {renderSearchResultItem(item)}
              </Item>
            ))}
          </ListContainer>
        ) : (
          <MarginBox>
            <Empty description={emptyDescription ?? 'Cannot find result'} />
          </MarginBox>
        ))}
    </MarginBox>
  );
}

export default PermissionSelectContentBox;

const ListContainer = styled.div`
  max-height: 250px;
  margin-top: 1rem;
  overflow-y: auto;
`;

const Item = styled.button`
  ${flexRowSpaceBetweenStyle}
  width: 100%;
  margin: 0.25rem 0;
  padding: 0.5rem 1rem;
  background-color: #fff;
  border-radius: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.gray2};
  color: #000;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray2};
  }
`;

const SelectedItem = styled(Item)`
  padding: 0.25rem 0.5rem 0.25rem 1rem;

  &:hover {
    background-color: #fff;
  }
`;

const CloseButton = styled.button`
  display: flex;
  padding: 0.5rem;
  background-color: #fff;
  color: #000;
`;

const MarginBox = styled.div`
  margin-top: 1rem;
`;
