import { PROJECT_TYPE } from '@dogu-private/types';
import { Radio, RadioGroupProps } from 'antd';
import styled from 'styled-components';

import { flexRowCenteredStyle } from '../../styles/box';
import ProjectTypeIcon from './ProjectTypeIcon';

const ProjectTypeRadio = (props: Omit<RadioGroupProps, 'children'>) => {
  const iconStyle: React.CSSProperties = {
    fontSize: '1.75rem',
  };

  return (
    <StyledRadioGroup defaultValue={PROJECT_TYPE.WEB} buttonStyle="solid" {...props}>
      <StyledRadio value={PROJECT_TYPE.WEB}>
        <IconWrapper>
          <ProjectTypeIcon type={PROJECT_TYPE.WEB} style={iconStyle} />
        </IconWrapper>
        <Title>Web</Title>
      </StyledRadio>
      <StyledRadio value={PROJECT_TYPE.APP}>
        <IconWrapper>
          <ProjectTypeIcon type={PROJECT_TYPE.APP} style={iconStyle} />
        </IconWrapper>
        <Title>Mobile App</Title>
      </StyledRadio>
      <StyledRadio value={PROJECT_TYPE.GAME}>
        <IconWrapper>
          <ProjectTypeIcon type={PROJECT_TYPE.GAME} style={iconStyle} />
        </IconWrapper>
        <Title>Game</Title>
      </StyledRadio>
      <StyledRadio value={PROJECT_TYPE.CUSTOM}>
        <IconWrapper>
          <ProjectTypeIcon type={PROJECT_TYPE.CUSTOM} style={iconStyle} />
        </IconWrapper>
        <Title>Custom</Title>
      </StyledRadio>
    </StyledRadioGroup>
  );
};

export default ProjectTypeRadio;

const StyledRadioGroup = styled(Radio.Group)`
  width: 100%;
  display: flex;
  align-items: center;
`;

const StyledRadio = styled(Radio.Button)`
  width: 25% !important;
  height: 80px !important;

  & > span:not(.ant-radio-button) {
    ${flexRowCenteredStyle}
    flex-direction: column;
    height: 100%;
  }
`;

const IconWrapper = styled.div`
  ${flexRowCenteredStyle}
`;

const Title = styled.b`
  margin-top: 0.25rem;
  display: block;
  line-height: 1.5;
`;
