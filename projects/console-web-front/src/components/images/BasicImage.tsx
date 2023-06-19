import Image, { ImageProps } from 'next/image';
import styled from 'styled-components';

interface Props extends ImageProps {
  imageWidth: string;
  imageHeight: string;
  circle?: boolean;
  radius?: number;
}

const BasicImage = ({ circle, imageWidth, imageHeight, radius, style, ...rest }: Props) => {
  return (
    <Box circle={circle} width={imageWidth} height={imageHeight} radius={radius} style={style}>
      <Image {...rest} style={{ objectFit: 'contain' }} fill sizes={imageWidth} alt="image" />
    </Box>
  );
};

const Box = styled.div<{ width: string; height: string; circle?: boolean; radius?: number }>`
  position: relative;
  display: flex;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  overflow: hidden;
  border-radius: ${(props) => props.radius ?? 'none'};

  img {
    border-radius: ${(props) => (props.circle ? '50%' : '0')};
  }
`;

export default BasicImage;
