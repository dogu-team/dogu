import styled from 'styled-components';

interface Props {
  title: string;
  style?: React.CSSProperties;
}

const SettingTitleDivider = ({ title, style }: Props) => {
  return (
    <Box style={style}>
      <div>
        <p>{title}</p>
      </div>
    </Box>
  );
};

export default SettingTitleDivider;

const Box = styled.div`
  margin: 2rem 0 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.gray3};

  div {
    margin-bottom: 0.5rem;
  }

  p {
    line-height: 1.5;
    font-size: 1.2rem;
    font-weight: 600;
  }
`;
