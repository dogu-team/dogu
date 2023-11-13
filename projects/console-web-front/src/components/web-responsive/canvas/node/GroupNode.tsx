import { Vendor } from '@dogu-private/device-data';
import styled from 'styled-components';

import PageImage, { PageImageProps } from '../PageImage';
import PageImageSection from '../PageImageSection';
import { URLTitle } from '../URLTitle';

export interface GroupNodeDataProps {
  url: string;
  vendors: Vendor[];
  pageImagePropsMap: { [vendor in Vendor]?: PageImageProps[] };
}

export interface GroupNodeProps {
  data: GroupNodeDataProps;
}

const GroupNode = ({ data }: GroupNodeProps) => {
  const { url, vendors, pageImagePropsMap: pageImageItemMap } = data;

  return (
    <Box>
      <URLBox>
        <URLTitle title={url} />
      </URLBox>
      {vendors.map((vendor) => {
        const pageImageProps = pageImageItemMap[vendor];

        if (!pageImageProps) {
          return null;
        }

        return (
          <>
            <PageImageSection title={vendor} />
            <PageImageBox>
              {pageImageProps.map((item) => {
                return <PageImage key={item.imageUrl} {...item} />;
              })}
            </PageImageBox>
          </>
        );
      })}
    </Box>
  );
};

const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

const URLBox = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 12rem;
`;

const PageImageBox = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
`;

export default GroupNode;
