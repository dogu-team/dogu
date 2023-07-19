import { FieldTimeOutlined, RightOutlined } from '@ant-design/icons';
import { DestBase } from '@dogu-private/console';
import { DEST_STATE } from '@dogu-private/types';
import { Tabs, TabsProps } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import DestLogController from 'src/components/pipelines/DestLogController';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import DestStatusIcon from './DestStatusIcon';
import DestTypeTag from './DestTypeTag';
import RuntimeTimer from './RuntimeTimer';
import DestProfileController from './DestProfileController';
import { isDestEndedWithData } from '../../utils/pipeline';
import DestRuntimeTimer from './DestRuntimeTimer';

interface Props {
  destUnit: DestBase;
}

const DestUnit = ({ destUnit }: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (destUnit.destId === Number(router.query.test)) {
      ref.current?.scrollIntoView();
    }
  }, []);

  const items: TabsProps['items'] = [
    {
      key: 'test-logs',
      label: t('routine:resultTabScriptLogMenuTitle'),
      children: <DestLogController dest={destUnit} logType="userProjectLogs" />,
    },
    {
      key: 'device-logs',
      label: t('routine:resultTabDeviceLogMenuTitle'),
      children: <DestLogController dest={destUnit} logType="deviceLogs" />,
    },
    {
      key: 'profile',
      label: t('routine:resultTabDeviceProfileMenuTitle'),
      children: <DestProfileController destUnit={destUnit} />,
    },
  ];

  const openable = isDestEndedWithData(destUnit.state);

  return (
    <>
      <Box
        onClick={() => {
          if (openable) {
            setIsOpen((prev) => !prev);
          }
        }}
      >
        <FlexRow>
          {openable && (
            <ButtonIconWrapper isOpen={isOpen}>
              <RightOutlined />
            </ButtonIconWrapper>
          )}
          <IconWrapper>
            <DestStatusIcon state={destUnit.state} />
          </IconWrapper>
          <div>
            <DestTypeTag type={destUnit.type} />
            <Name>{destUnit.name}</Name>
          </div>
        </FlexRow>

        <FlexRow>
          <FieldTimeOutlined style={{ marginRight: '.25rem' }} />
          <DestRuntimeTimer dest={destUnit} />
        </FlexRow>
      </Box>

      {isOpen && openable && (
        <TabWrapper>
          <Tabs defaultActiveKey="test-logs" items={items} destroyInactiveTabPane />
        </TabWrapper>
      )}
    </>
  );
};

export default DestUnit;

const Box = styled.button`
  ${flexRowSpaceBetweenStyle}
  width: 100%;
  padding: 0.5rem 1rem;
  margin: 0.25rem 0;
  background-color: ${(props) => props.theme.main.colors.white};
  border-radius: 0.5rem;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const ButtonIconWrapper = styled.div<{ isOpen: boolean }>`
  margin-right: 0.75rem;
  transform: ${(props) => (props.isOpen ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.3s;
`;

const IconWrapper = styled.div`
  margin-right: 0.5rem;
`;

const Name = styled.p`
  display: inline-block;
  line-height: 1.4;
  font-size: 0.9rem;
`;

const TabWrapper = styled.div`
  background-color: ${(props) => props.theme.main.colors.white};
  margin-top: -1rem;
  padding: 1.5rem 1rem 1rem 1rem;
  border-radius: 0 0 0.5rem 0.5rem;
`;
