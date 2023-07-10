import { DeviceBase } from '@dogu-private/console';
import { Modal, Tag } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

import { getLocaleFormattedDate } from 'src/utils/locale';
import RunnerPrefixTag from './RunnerPrefixTag';
import { flexRowBaseStyle } from '../../styles/box';

interface Props {
  isOpen: boolean;
  runner: DeviceBase;
  close: () => void;
}

const RunnerDetailModal = ({ isOpen, runner, close }: Props) => {
  const { t, lang } = useTranslation();
  const isGlobal = runner.isGlobal === 1;

  return (
    <Modal open={isOpen} closable onCancel={close} title={t('runner:runnerDetailModalTitle')} centered destroyOnClose footer={null}>
      <Box>
        <Content>
          <StyledH4>{t('runner:runnerDetailNameTitle')}</StyledH4>
          <FlexBox>
            <p>{runner?.name}</p>
          </FlexBox>
        </Content>
        {!isGlobal && (
          <Content>
            <StyledH4>{t('runner:runnerDetailProjectTitle')}</StyledH4>
            <div>
              {runner?.projects?.map((item) => (
                <Tag key={item.projectId}>{item.name}</Tag>
              ))}
            </div>
          </Content>
        )}
        <Content>
          <StyledH4>{t('runner:runnerDetailTagTitle')}</StyledH4>
          <div>
            {runner?.deviceTags?.map((item) => (
              <Tag key={item.deviceTagId}>{item.name}</Tag>
            ))}
          </div>
        </Content>
        <Content>
          <StyledH4>{t('runner:runnerDetailConnectedHostTitle')}</StyledH4>
          <p>{runner?.host?.name}</p>
        </Content>
        <Content>
          <StyledH4>{t('runner:runnerDetailCreatedAtTitle')}</StyledH4>
          <p>{getLocaleFormattedDate(lang, new Date(runner?.createdAt ?? 0))}</p>
        </Content>
        <Content>
          <StyledH4>{t('runner:runnerDetailUpdatedAtTitle')}</StyledH4>
          <p>{getLocaleFormattedDate(lang, new Date(runner?.updatedAt ?? 0))}</p>
        </Content>
      </Box>
    </Modal>
  );
};

export default RunnerDetailModal;

const Box = styled.div``;

const Content = styled.div`
  margin-bottom: 1.5rem;
`;

const FlexBox = styled.div`
  ${flexRowBaseStyle}
`;

const StyledH4 = styled.h4`
  margin-bottom: 0.2rem;
  font-size: 1.05rem;
  font-weight: 500;
`;
