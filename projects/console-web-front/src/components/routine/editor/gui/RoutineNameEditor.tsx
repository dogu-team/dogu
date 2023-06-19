import { Input } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../../../styles/box';

interface Props {
  name: string;
  onChange: (name: string) => void;
}

const RoutineNameEditor = ({ name, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <Box>
      <RoutineName>{t('routine:routineGuiEditorRoutineNameLabel')}</RoutineName>
      <Input defaultValue={name} value={name} onChange={(e) => onChange(e.target.value)} placeholder={t('routine:routineGuiEditorRoutineNamePlaceholder')} />
    </Box>
  );
};

export default RoutineNameEditor;

const Box = styled.div`
  ${flexRowBaseStyle}
  margin-bottom: 1rem;
`;

const RoutineName = styled.p`
  font-weight: 600;
  margin-right: 0.5rem;
  flex-shrink: 0;
  font-size: 1rem;
`;
