import { BillingHistoryBase } from '@dogu-private/console';
import { Divider } from 'antd';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { getLocaleFormattedDate } from '../../utils/locale';
import ErrorBox from '../common/boxes/ErrorBox';

interface Props {
  history: BillingHistoryBase;
}

const BillingHistoryDetail: React.FC<Props> = ({ history }) => {
  const router = useRouter();

  if (!history.billingSubscriptionPlanHistories) {
    return <ErrorBox title="Something went wrong" desc="No details for invoice" />;
  }

  return (
    <Box>
      <div>
        결제일:{' '}
        {getLocaleFormattedDate(router.locale, new Date(history.purchasedAt), {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      <div>Payment method:</div>

      <Divider />

      <div>
        {history.billingSubscriptionPlanHistories.map((planHistory) => {
          return (
            <div key={planHistory.billingSubscriptionPlanHistoryId}>
              <div>{planHistory.type}</div>
              <div>{planHistory.option}</div>
              <div>{planHistory.period}</div>
              <div>{planHistory.purchasedAmount}</div>
            </div>
          );
        })}
      </div>

      <Divider />

      <div>Total: {history.totalPrice}</div>
    </Box>
  );
};

export default BillingHistoryDetail;

const Box = styled.div`
  background-color: ${(props) => props.theme.colorPrimary}22;
  padding: 1rem;
  border-radius: 0.5rem;
`;
