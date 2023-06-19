import { Button, Radio } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';

import { flexRowSpaceBetweenStyle } from '../../../styles/box';
import { RoutineEditMode } from '../../../types/routine';

interface Props {
  saveButtonText: string;
  onSave: () => Promise<void>;
  mode: RoutineEditMode;
  onChangeMode: (mode: RoutineEditMode) => void;
}

const RoutineEditorMenu = ({ saveButtonText, onSave, mode, onChangeMode }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSave = async () => {
    setLoading(true);
    onSave();
    setLoading(false);
  };

  return (
    <MenuBar>
      <div>
        <Radio.Group
          value={mode}
          defaultValue={(router.query.mode as RoutineEditMode | undefined) ?? RoutineEditMode.SCRIPT}
          buttonStyle="solid"
          onChange={(e) => onChangeMode(e.target.value)}
        >
          <Radio.Button value={RoutineEditMode.GUI}>{t('routine:routineEditGuiModeButtonTitle')}</Radio.Button>
          <Radio.Button value={RoutineEditMode.SCRIPT} id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'edit-script-routine-btn' : undefined}>
            {t('routine:routineEditScriptModeButtonTitle')}
          </Radio.Button>
          <Radio.Button value={RoutineEditMode.PREVIEW}>{t('routine:routineEditPreviewModeButtonTitle')}</Radio.Button>
        </Radio.Group>
      </div>
      <div>
        <Button type="primary" loading={loading} onClick={handleSave} access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'save-routine-btn' : undefined}>
          {saveButtonText}
        </Button>
      </div>
    </MenuBar>
  );
};

export default RoutineEditorMenu;

const MenuBar = styled.div`
  ${flexRowSpaceBetweenStyle}
  margin-bottom: 1rem;
`;
