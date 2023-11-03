import { Vendor } from '@dogu-private/device-data';
import styled from 'styled-components';

import PageImage, { PageImageProps } from '../PageImage';
import Section from '../Section';

interface GroupNodeProps {
  data: {
    category: Vendor;
    pageImageItems: PageImageProps[];
  };
}

const GroupNode = ({ data }: GroupNodeProps) => {
  return (
    <Box>
      <Section title={data.category} />
      <PageImageBox>
        {data.pageImageItems.map((item) => {
          return <PageImage key={item.imageUrl} {...item} />;
        })}
      </PageImageBox>
    </Box>
  );
};

const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

const PageImageBox = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
`;

export default GroupNode;
