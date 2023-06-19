import { CheckOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styled from 'styled-components';

import H4 from '../common/headings/H4';

interface Props {
  name: string;
  description: string;
  price: string;
  onClickStart: () => void;
  possibleThings: string[];
}

const PriceBoard = ({ name, description, price, onClickStart, possibleThings }: Props) => {
  return (
    <PriceBox>
      <PriceTitleBox>
        <H4>{name}</H4>
        <PriceDesc>{description}</PriceDesc>
      </PriceTitleBox>
      <PriceTextBox>
        <H4>{price}</H4>
      </PriceTextBox>
      <PriceButtonBox>
        <Button type="primary" style={{ width: '100%' }} onClick={onClickStart}>
          시작하기
        </Button>
      </PriceButtonBox>
      <PriceProsBox>
        <PriceDesc>이런걸 할 수 있어요.</PriceDesc>
        <PriceProsContainer>
          {possibleThings.map((item) => (
            <PriceProsItem key={item}>
              <CheckOutlined style={{ color: 'green', fontSize: '18px', marginRight: '8px' }} />
              {item}
            </PriceProsItem>
          ))}
        </PriceProsContainer>
      </PriceProsBox>
    </PriceBox>
  );
};

export default PriceBoard;

const PriceBox = styled.div`
  padding: 12px;
  flex: 1;
  border: 1px solid ${(props) => props.theme.colors.gray2};
  border-radius: 8px;
  box-shadow: 0 0 1.5rem rgb(0 0 0 / 10%);
`;

const PriceTitleBox = styled.div`
  padding-bottom: 16px;
  border-bottom: 1px solid ${(props) => props.theme.colors.gray2};
`;

const PriceDesc = styled.p`
  margin-top: 4px;
  font-size: 14px;
  color: ${(props) => props.theme.colors.gray5};
`;

const PriceTextBox = styled.div`
  margin: 20px 0 12px;
`;

const PriceButtonBox = styled.div`
  padding: 8px 0;
`;

const PriceProsBox = styled.div`
  margin-top: 12px;
`;

const PriceProsContainer = styled.ul`
  margin-top: 8px;
`;

const PriceProsItem = styled.li`
  padding: 8px 0;
`;
