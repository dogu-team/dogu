import { Button, TableColumnsType } from 'antd';
import styled from 'styled-components';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

import { AllDevicePriceData, PData, PricingAvailability, deviceFarmPricingData, automationPricingData } from 'src/resources/pricing';
import { PricingMenu } from 'src/types/query';
import H5 from '../common/headings/H5';

interface Props {
  menu: PricingMenu | undefined;
}

const PriceContentCompareTable = ({ menu }: Props) => {
  let data = automationPricingData;
  if (menu === PricingMenu.DEVICE_FARM) {
    data = deviceFarmPricingData;
  }

  return (
    <Box>
      <HeaderBox>
        <Header>
          <HeaderContent>
            <H5>Windows</H5>
            <p>₩0 / Device</p>
            <StyledButton type="primary">Start now</StyledButton>
          </HeaderContent>
          <HeaderContent>
            <H5>Android</H5>
            <p>₩0 / Device</p>
            <StyledButton type="primary">Start now</StyledButton>
          </HeaderContent>
          <HeaderContent>
            <H5>iOS</H5>
            <p>₩0 / Device</p>
            <StyledButton type="primary">Start now</StyledButton>
          </HeaderContent>
          <HeaderContent>
            <H5>Mac</H5>
            <p>₩0 / Device</p>
            <StyledButton type="primary">Start now</StyledButton>
          </HeaderContent>
        </Header>
      </HeaderBox>
      <div style={{ display: 'flex' }}>
        <TableDesc>
          {data.map((item) => {
            return <TableDescText key={`price-${item.title}`}>{item.title}</TableDescText>;
          })}
        </TableDesc>
        <TableBox>
          <Table>
            <Column>
              {data
                .map((item) => item.data.windows)
                .map((item, i) => {
                  if (item.type === 'availability') {
                    return (
                      <Cell key={`${item.content}-${i}`}>
                        {item.content === PricingAvailability.AVAILABLE ? (
                          <CheckCircleFilled style={{ color: 'green', fontSize: '1.2rem' }} />
                        ) : (
                          <CloseCircleFilled style={{ color: 'red', fontSize: '1.2rem' }} />
                        )}
                      </Cell>
                    );
                  } else {
                    return <p key={`${item.content}-${i}`}>{item.content}</p>;
                  }
                })}
            </Column>
            <Column>
              {data
                .map((item) => item.data.android)
                .map((item, i) => {
                  if (item.type === 'availability') {
                    return (
                      <Cell key={`${item.content}-${i}`}>
                        {item.content === PricingAvailability.AVAILABLE ? (
                          <CheckCircleFilled style={{ color: 'green', fontSize: '1.2rem' }} />
                        ) : (
                          <CloseCircleFilled style={{ color: 'red', fontSize: '1.2rem' }} />
                        )}
                      </Cell>
                    );
                  } else {
                    return <p key={`${item.content}-${i}`}>{item.content}</p>;
                  }
                })}
            </Column>
            <Column>
              {data
                .map((item) => item.data.ios)
                .map((item, i) => {
                  if (item.type === 'availability') {
                    return (
                      <Cell key={`${item.content}-${i}`}>
                        {item.content === PricingAvailability.AVAILABLE ? (
                          <CheckCircleFilled style={{ color: 'green', fontSize: '1.2rem' }} />
                        ) : (
                          <CloseCircleFilled style={{ color: 'red', fontSize: '1.2rem' }} />
                        )}
                      </Cell>
                    );
                  } else {
                    return <p key={`${item.content}-${i}`}>{item.content}</p>;
                  }
                })}
            </Column>
            <Column>
              {data
                .map((item) => item.data.mac)
                .map((item, i) => {
                  if (item.type === 'availability') {
                    return (
                      <Cell key={`${item.content}-${i}`}>
                        {item.content === PricingAvailability.AVAILABLE ? (
                          <CheckCircleFilled style={{ color: 'green', fontSize: '1.2rem' }} />
                        ) : (
                          <CloseCircleFilled style={{ color: 'red', fontSize: '1.2rem' }} />
                        )}
                      </Cell>
                    );
                  } else {
                    return <p key={`${item.content}-${i}`}>{item.content}</p>;
                  }
                })}
            </Column>
          </Table>
        </TableBox>
      </div>
    </Box>
  );
};

export default PriceContentCompareTable;

const Box = styled.div`
  width: 100%;
`;

const TableBox = styled.div`
  flex: 1;
`;

const HeaderBox = styled.div`
  position: sticky;
  top: 64px;
  flex: 1;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
`;

const Header = styled.div`
  display: flex;
  width: calc(100% - 250px);
  justify-content: flex-end;

  & > * {
    margin-right: 1rem;
  }
  & > *:last-child {
    margin-right: 0;
  }
  & > *:nth-child(2n) {
    background-color: #efefef44;
  }
  & > *:nth-child(2n - 1) {
    background-color: #efefefaa;
  }
`;

const HeaderContent = styled.div`
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: center;
  justify-content: space-between;
  height: 200px;
`;

const TableDesc = styled.div`
  width: 250px;
  margin-top: 2rem;
`;

const TableDescText = styled.div`
  display: flex;
  height: 55px;
  align-items: center;
  font-weight: 600;
`;

const StyledButton = styled(Button)`
  width: 100%;
  margin-top: 0.5rem;
`;

const Table = styled.div`
  display: flex;

  & > * {
    margin-right: 1rem;
  }
  & > *:last-child {
    margin-right: 0;
  }

  & > *:nth-child(2n) {
    background-color: #efefef44;
  }
  & > *:nth-child(2n - 1) {
    background-color: #efefefaa;
  }
`;

const Column = styled.div`
  flex: 1;
  padding: 2rem 1rem;
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 55px;
`;
