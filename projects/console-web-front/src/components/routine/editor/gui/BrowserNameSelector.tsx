import { Select, SelectProps } from 'antd';
import Image from 'next/image';
import styled from 'styled-components';

import resources from '../../../../resources';
import { flexRowBaseStyle } from '../../../../styles/box';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

const BrowserNameSelector = ({ ...props }: Props) => {
  // browserName: chrome, firefox, edge, safari, samsung-internet

  const options: SelectProps['options'] = [
    {
      label: (
        <FlexRow>
          <StyledImage src={resources.icons.chrome} width={20} height={20} alt={'Chrome'} />
          Chrome
        </FlexRow>
      ),
      value: 'chrome',
    },
    {
      label: (
        <FlexRow>
          <StyledImage src={resources.icons.firefox} width={20} height={20} alt={'Firefox'} />
          Firefox
        </FlexRow>
      ),
      value: 'firefox',
    },
    {
      label: (
        <FlexRow>
          <StyledImage src={resources.icons.safari} width={20} height={20} alt={'Safari'} />
          Safari
        </FlexRow>
      ),
      value: 'safari',
    },
    {
      label: (
        <FlexRow>
          <StyledImage src={resources.icons.edge} width={20} height={20} alt={'Edge'} />
          Edge
        </FlexRow>
      ),
      value: 'edge',
    },
    {
      label: (
        <FlexRow>
          <StyledImage src={resources.icons.samsungIntenet} width={20} height={20} alt={'Samsung Internet'} />
          Samsung Internet
        </FlexRow>
      ),
      value: 'samsung-internet',
    },
  ];

  return <Select<string> placeholder="Select browser" options={options} dropdownMatchSelectWidth={false} {...props} />;
};

export default BrowserNameSelector;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const StyledImage = styled(Image)`
  margin-right: 0.5rem;
`;
