import { BookOutlined } from '@ant-design/icons';
import { PROJECT_TYPE } from '@dogu-private/types';
import { Button, Radio, Space } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { RiExternalLinkLine } from 'react-icons/ri';
import styled from 'styled-components';

import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../../styles/box';
import { RoutineEditMode } from '../../../types/routine';

interface Props {
  projectType: PROJECT_TYPE;
  saveButtonText: string;
  onSave: () => Promise<void>;
  mode: RoutineEditMode;
  onChangeMode: (mode: RoutineEditMode) => void;
}

const RoutineEditorMenu = ({ projectType, saveButtonText, onSave, mode, onChangeMode }: Props) => {
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
      <FlexRow>
        {projectType !== PROJECT_TYPE.CUSTOM && (
          <Radio.Group
            value={mode}
            defaultValue={(router.query.mode as RoutineEditMode | undefined) ?? RoutineEditMode.SCRIPT}
            buttonStyle="solid"
            onChange={(e) => onChangeMode(e.target.value)}
          >
            <Radio.Button value={RoutineEditMode.GUI}>{t('routine:routineEditGuiModeButtonTitle')}</Radio.Button>
            <Radio.Button
              value={RoutineEditMode.SCRIPT}
              id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'edit-script-routine-btn' : undefined}
            >
              {t('routine:routineEditScriptModeButtonTitle')}
            </Radio.Button>
          </Radio.Group>
        )}
        {mode === RoutineEditMode.SCRIPT && (
          <div style={{ marginLeft: '.5rem' }}>
            <a href="https://docs.dogutech.io/routine/routines/syntax" target="_blank">
              YAML guide <RiExternalLinkLine />
            </a>
          </div>
        )}
      </FlexRow>
      <Space>
        <Button loading={loading} onClick={() => router.back()} access-id={'cancel-routine-btn'}>
          {t('common:cancel')}
        </Button>
        <Button type="primary" loading={loading} onClick={handleSave} access-id={'save-routine-btn'}>
          {saveButtonText}
        </Button>
      </Space>
    </MenuBar>
  );
};

export default RoutineEditorMenu;

const MenuBar = styled.div`
  ${flexRowSpaceBetweenStyle}
  margin-bottom: 1rem;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
