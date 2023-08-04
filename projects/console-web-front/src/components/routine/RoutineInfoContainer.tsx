import { EllipsisOutlined } from '@ant-design/icons';
import { RoutineBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Button, Dropdown, MenuProps } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { deleteRoutine } from '../../api/routine';
import useEventStore from '../../stores/events';
import { flexRowBaseStyle } from '../../styles/box';
import { menuItemButtonStyles } from '../../styles/button';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';
import MenuItemButton from '../buttons/MenuItemButton';
import H6 from '../common/headings/H6';

interface Props {
  orgId: OrganizationId;
  projectId: ProjectId;
  routine?: RoutineBase;
}

const RoutineInfoContainer = ({ orgId, projectId, routine }: Props) => {
  const router = useRouter();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();

  const handleDeleteRoutine = async () => {
    if (!routine) {
      return;
    }

    try {
      await deleteRoutine(orgId, projectId, routine.routineId);
      sendSuccessNotification(t('routine:deleteRoutineSuccessMsg'));
      fireEvent('onRoutineDeleted');
      router.push(`/dashboard/${orgId}/projects/${projectId}/routines`);
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('routine:deleteRoutineFailureMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleDeleteRoutine}
          modalTitle={t('routine:deleteRoutineModalTitle')}
          modalButtonTitle={t('routine:deleteRoutineModalButtonText')}
          modalContent={t('routine:deleteRoutineModalWarningMsg', { name: routine?.name })}
        >
          {t('routine:deleteRoutineMenuTitle')}
        </MenuItemButton>
      ),
      key: 'delete',
      style: { padding: '0' },
    },
  ];

  return (
    <RoutineInfoBox>
      <FlexRowBox>
        <H6>{!!routine ? routine?.name : t('routine:routineSidebarAllMenuTitle')}</H6>
      </FlexRowBox>

      {!!routine && (
        <RoutineMenuButtonBox>
          <Dropdown trigger={['click']} menu={{ items }}>
            <Button icon={<EllipsisOutlined style={{ fontSize: '1.1rem' }} />} />
          </Dropdown>
        </RoutineMenuButtonBox>
      )}
    </RoutineInfoBox>
  );
};

export default RoutineInfoContainer;

const FlexRowBox = styled.div`
  ${flexRowBaseStyle}
`;

const RoutineMenuButtonBox = styled.div`
  display: flex;
  flex-direction: row;
`;

const RoutineInfoBox = styled(FlexRowBox)`
  justify-content: space-between;
`;

const MenuLink = styled(Link)`
  ${menuItemButtonStyles}
  display: block;
  color: #000;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray2} !important;
  }
`;
