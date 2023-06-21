import { Vector3 } from 'gamium/common';
import { message } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled, { css } from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { ResizedObjectInfo } from '../../types/streaming';

interface ButtonProps {
  children: string | undefined;
  disabled?: boolean;
}

const CopyButton = ({ children, disabled }: ButtonProps) => {
  const { t } = useTranslation();

  const copyText = async () => {
    if (!children) {
      return;
    }

    try {
      await navigator.clipboard.writeText(children);
      message.success(t('common:copyClipboard'));
    } catch (e) {
      message.error(t('common:copyClipboardFailed'));
    }
  };

  return (
    <StyledButton onClick={copyText} disabled={disabled}>
      {children}
    </StyledButton>
  );
};

interface Props {
  selectedObjects: ResizedObjectInfo[] | undefined;
  hitPoint: Vector3 | undefined;
}

const GameObjectDetail = ({ selectedObjects, hitPoint }: Props) => {
  const { t } = useTranslation();

  const origin = selectedObjects && selectedObjects.length > 0 ? selectedObjects[0].origin : undefined;

  return (
    <Box>
      <Section>
        <StyledTitle>Hit Point</StyledTitle>
        {hitPoint ? (
          <div>
            <PositionItem>
              <b>X:</b>
              <CopyButton>{hitPoint.x.toFixed(1)}</CopyButton>
            </PositionItem>
            <PositionItem>
              <b>Y:</b>
              <CopyButton>{hitPoint.y.toFixed(1)}</CopyButton>
            </PositionItem>
            <PositionItem>
              <b>Z:</b>
              <CopyButton>{hitPoint.z.toFixed(1)}</CopyButton>
            </PositionItem>
          </div>
        ) : (
          <p>No hitpoint</p>
        )}
      </Section>

      <Section>
        <StyledTitle>Properties</StyledTitle>
        <FlexRow>
          <TitleWrapper>
            <Title>Path</Title>
            <Title>Name</Title>
            <Title>Text</Title>
            <Title>Screen position</Title>
            <Title>Screen rect size</Title>
            <Title>Position</Title>
            <Title>Rotation</Title>
          </TitleWrapper>

          <ContentWrapper>
            {origin ? (
              <ContentWrapper>
                <Content>
                  <CopyButton>{`${origin.path}`}</CopyButton>
                </Content>
                <Content>
                  <CopyButton>{`${origin.name}`}</CopyButton>
                </Content>
                <Content>
                  <CopyButton disabled={!origin.text}>{`${origin.text}`}</CopyButton>
                </Content>
                <Content>
                  <PositionItem>
                    <b>X:</b>
                    <CopyButton>{origin.screenPosition?.x.toFixed(1)}</CopyButton>
                  </PositionItem>
                  <PositionItem>
                    <b>Y:</b>
                    <CopyButton>{origin.screenPosition?.y.toFixed(1)}</CopyButton>
                  </PositionItem>
                  <PositionItem>
                    <b>Z:</b>
                    <CopyButton>{origin.screenPosition?.z.toFixed(1)}</CopyButton>
                  </PositionItem>
                </Content>
                <Content>
                  <PositionItem>
                    <b>X:</b>
                    <CopyButton>{origin.screenRectSize?.x.toFixed(1)}</CopyButton>
                  </PositionItem>
                  <PositionItem>
                    <b>Y:</b>
                    <CopyButton>{origin.screenRectSize?.y.toFixed(1)}</CopyButton>
                  </PositionItem>
                </Content>
                <Content>
                  <PositionItem>
                    <b>X:</b>
                    <CopyButton>{origin.position?.x.toFixed(1)}</CopyButton>
                  </PositionItem>
                  <PositionItem>
                    <b>Y:</b>
                    <CopyButton>{origin.position?.y.toFixed(1)}</CopyButton>
                  </PositionItem>
                  <PositionItem>
                    <b>Z:</b>
                    <CopyButton>{origin.position?.z.toFixed(1)}</CopyButton>
                  </PositionItem>
                </Content>
                <Content>
                  <PositionItem>
                    <b>X:</b>
                    <CopyButton>{origin.rotation?.x.toFixed(1)}</CopyButton>
                  </PositionItem>
                  <PositionItem>
                    <b>Y:</b>
                    <CopyButton>{origin.rotation?.y.toFixed(1)}</CopyButton>
                  </PositionItem>
                  <PositionItem>
                    <b>Z:</b>
                    <CopyButton>{origin.rotation?.z.toFixed(1)}</CopyButton>
                  </PositionItem>
                  <PositionItem>
                    <b>W:</b>
                    <CopyButton>{origin.rotation?.w.toFixed(1)}</CopyButton>
                  </PositionItem>
                </Content>
              </ContentWrapper>
            ) : (
              <FlexRow style={{ justifyContent: 'center' }}>{t('device-streaming:inspectorSelectObjectText')}</FlexRow>
            )}
          </ContentWrapper>
        </FlexRow>
      </Section>
    </Box>
  );
};

export default GameObjectDetail;

const Box = styled.div`
  height: 100%;
  border-top: 1px solid ${(props) => props.theme.main.colors.gray6};
  padding: 0.5rem 0;
  font-size: 0.75rem;
`;

const PositionItem = styled.span`
  margin-right: 0.25rem;

  b {
    font-weight: 500;
    margin-right: 0.1rem;
  }
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const StyledTitle = styled.p`
  color: ${(props) => props.theme.main.colors.gray3};
  margin-bottom: 0.2rem;
  font-size: 0.9rem;
`;

const StyledButton = styled.button`
  background-color: #fff;
  color: #000;
  cursor: copy;
  user-select: none;
  text-align: left;
  white-space: nowrap;

  &:hover {
    background-color: #dcdcdc;
  }
`;

const Section = styled.div`
  padding-bottom: 0.5rem;
`;

const TitleWrapper = styled.div`
  margin-right: 0.75rem;
  flex-shrink: 0;
`;

const propertyStyle = css`
  ${flexRowBaseStyle}
  height: 20px;
  text-align: left;
`;

const Title = styled.p`
  ${propertyStyle}
  font-weight: 500;
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const Content = styled.div`
  ${propertyStyle}
`;
