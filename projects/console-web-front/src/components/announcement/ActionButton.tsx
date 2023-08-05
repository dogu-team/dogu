import styled from 'styled-components';

interface Props {
  onClick: () => void;
  icon: React.ReactNode;
  isSelected: boolean;
}

const ActionButton = ({ onClick, icon }: Props) => {
  return <Button onClick={onClick}>{icon}</Button>;
};

export default ActionButton;

const Button = styled.button`
  background-color: #fff;
  color: #fff;
  padding: 0.5rem 1rem;

  &:hover svg {
    width: 32px;
    height: 32px;
  }
`;
