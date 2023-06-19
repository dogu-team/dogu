import { CaretDownFilled, CaretDownOutlined, CaretUpOutlined, CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../../../styles/box';

interface Props {
  onDeleteClicked: () => void;
  onMoveUpClicked: () => void;
  onMoveDownClicked: () => void;
}

const ContainerMenu = ({ onDeleteClicked, onMoveDownClicked, onMoveUpClicked }: Props) => {
  return (
    <Box>
      <StyledButton onClick={onMoveUpClicked}>
        <CaretUpOutlined />
      </StyledButton>
      <StyledButton onClick={onMoveDownClicked}>
        <CaretDownOutlined />
      </StyledButton>
      <StyledButton onClick={onDeleteClicked}>
        <CloseOutlined />
      </StyledButton>
    </Box>
  );
};

const Box = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  ${flexRowBaseStyle}
`;

const StyledButton = styled.div`
  cursor: pointer;
  background-color: transparent;
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
  color: #000000;
`;

export default ContainerMenu;
