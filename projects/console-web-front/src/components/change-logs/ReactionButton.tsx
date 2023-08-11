import styled from 'styled-components';
import Image from 'next/image';

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  activeSrc: string;
  inactiveSrc: string;
  isSelected: boolean;
  inactive: boolean;
  imageAlt: string;
}

const ReactionButton = ({ activeSrc, inactiveSrc, isSelected, inactive, imageAlt, ...props }: Props) => {
  return (
    <Button isSelected={isSelected} {...props}>
      <Image src={inactive ? inactiveSrc : activeSrc} fill alt={imageAlt} />
    </Button>
  );
};

export default ReactionButton;

const Button = styled.button<{ isSelected: boolean }>`
  position: relative;
  width: ${(props) => (props.isSelected ? '36px' : '28px')};
  height: ${(props) => (props.isSelected ? '36px' : '28px')};
  cursor: pointer;
  border-radius: 50%;
  background-color: #fff;
`;
