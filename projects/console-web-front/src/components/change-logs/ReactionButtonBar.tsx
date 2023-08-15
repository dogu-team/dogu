import styled from 'styled-components';
import { isAxiosError } from 'axios';
import { ChangeLogId, ChangeLogReactionType } from '@dogu-private/types';
import { shallow } from 'zustand/shallow';

import resources from '../../resources/index';
import { deleteReaction, updateReaction } from '../../api/change-log';
import useRequest from '../../hooks/useRequest';
import { sendErrorNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import useEventStore from '../../stores/events';
import ReactionButton from './ReactionButton';

interface Props {
  selectedReaction: ChangeLogReactionType | undefined;
  changeLogId: ChangeLogId;
}

const ReactionButtonBar = ({ selectedReaction, changeLogId }: Props) => {
  const [patchLoading, requestPatch] = useRequest(updateReaction);
  const [deleteLoading, requestDelete] = useRequest(deleteReaction);
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);

  const handleClick = async (reactionType: ChangeLogReactionType) => {
    if (selectedReaction === reactionType) {
      try {
        await requestDelete(changeLogId);
        fireEvent('onChangeLogReactionUpdated');
      } catch (e) {
        if (isAxiosError(e)) {
          sendErrorNotification(`Failed to delete.\n${getErrorMessageFromAxios(e)}`);
        }
      }

      return;
    }

    try {
      await requestPatch(changeLogId, { reactionType });
      fireEvent('onChangeLogReactionUpdated');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to react.\n${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  return (
    <Box>
      <ReactionButton
        activeSrc={resources.icons.smilingFace}
        inactiveSrc={resources.icons.inactiveSmilingFace}
        isSelected={selectedReaction === ChangeLogReactionType.LIKE}
        onClick={() => handleClick(ChangeLogReactionType.LIKE)}
        disabled={patchLoading || deleteLoading}
        imageAlt="smile"
        inactive={selectedReaction !== undefined && selectedReaction !== ChangeLogReactionType.LIKE}
      />
      <ReactionButton
        activeSrc={resources.icons.neutralFace}
        inactiveSrc={resources.icons.inactiveNeutralFace}
        isSelected={selectedReaction === ChangeLogReactionType.NEUTRAL}
        onClick={() => handleClick(ChangeLogReactionType.NEUTRAL)}
        disabled={patchLoading || deleteLoading}
        imageAlt="neutral"
        inactive={selectedReaction !== undefined && selectedReaction !== ChangeLogReactionType.NEUTRAL}
      />
      <ReactionButton
        activeSrc={resources.icons.pensiveFace}
        inactiveSrc={resources.icons.inactivePensiveFace}
        isSelected={selectedReaction === ChangeLogReactionType.DISLIKE}
        onClick={() => handleClick(ChangeLogReactionType.DISLIKE)}
        disabled={patchLoading || deleteLoading}
        imageAlt="pensive"
        inactive={selectedReaction !== undefined && selectedReaction !== ChangeLogReactionType.DISLIKE}
      />
    </Box>
  );
};

export default ReactionButtonBar;

const Box = styled.div`
  width: 160px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Button = styled.button<{ isSelected: boolean }>`
  position: relative;
  width: ${(props) => (props.isSelected ? '36px' : '28px')};
  height: ${(props) => (props.isSelected ? '36px' : '28px')};
  cursor: pointer;
  border-radius: 50%;
  background-color: #fff;
`;
