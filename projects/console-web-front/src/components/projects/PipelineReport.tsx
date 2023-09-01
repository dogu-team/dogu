import { CalendarOutlined, LoadingOutlined } from '@ant-design/icons';
import { ProjectPipelineReportResponse } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/router';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import { flexRowBaseStyle, flexRowCenteredStyle } from '../../styles/box';
import { getFirstOfMonthDate } from '../../utils/date';
import { getErrorMessageFromAxios } from '../../utils/error';
import ErrorBox from '../common/boxes/ErrorBox';
import DashBoard from '../DashBoard';

interface Props {
  orgId: OrganizationId;
  projectId: ProjectId;
}

const PipelineReport = ({ orgId, projectId }: Props) => {
  const from = getFirstOfMonthDate();
  const router = useRouter();
  const { data, isLoading, error, mutate } = useSWR<ProjectPipelineReportResponse>(
    `/organizations/${orgId}/projects/${projectId}/pipeline-report?from=${from.toISOString()}`,
    swrAuthFetcher,
  );

  if (isLoading) {
    return (
      <Box>
        <LoadingOutlined />
      </Box>
    );
  }

  if (!data || error) {
    return (
      <Box>
        <ErrorBox title="Something went wrong" desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot get pipeline report information'} />
      </Box>
    );
  }

  const minutes = Math.floor(data.runtime / (1000 * 60));
  const seconds = Math.floor((data.runtime - minutes * 1000 * 60) / 1000);

  const chartData = [
    { name: 'Successes', value: data.successes },
    { name: 'Failures', value: data.failures },
  ];
  const colors = ['#5cb85c', '#e34646'];

  const canDrawChart = data.failures + data.successes > 0;
  const score = canDrawChart ? Number(((data.successes / (data.failures + data.successes)) * 100).toFixed(1)) : 0;
  const cleanRates = [
    { max: 30, color: '#e34646' },
    { max: 60, color: '#fcba03' },
    { max: 90, color: '#6499f5' },
    { max: 100, color: '#5cb85c' },
  ];

  return (
    <StyledDashboard title={'Pipeline reports'} flex={1}>
      <Box>
        <DateBox>
          <CalendarOutlined style={{ marginRight: '.25rem' }} />
          {Intl.DateTimeFormat(router.locale).format(from)} ~ now
        </DateBox>

        {data.total === 0 ? (
          <Inner>
            <p>Run at least 1 pipeline for report</p>
          </Inner>
        ) : (
          <Inner>
            <div>
              <ContentBox>
                <ContentTitle>Total durations</ContentTitle>
                <Content>
                  {minutes}m {seconds}s
                </Content>
              </ContentBox>
              <ContentBox style={{ marginBottom: '0' }}>
                <ContentTitle>Total pipelines</ContentTitle>
                <Content>{data.total} pipelines executed</Content>
              </ContentBox>
            </div>

            <ChartWrapper>
              {canDrawChart && (
                <PieChart width={200} height={200}>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                    {chartData.map((item, i) => (
                      <Cell key={`cell-${item.name}`} fill={colors[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ChartWrapper>

            <ScoreBox>
              <ScoreText>Clean rate</ScoreText>
              <Score color={cleanRates.find((item) => item.max >= score)?.color}>{score}%</Score>
            </ScoreBox>
          </Inner>
        )}
      </Box>
    </StyledDashboard>
  );
};

export default PipelineReport;

const StyledDashboard = styled(DashBoard)`
  min-width: 600px;
  max-width: 650px;

  @media only screen and (max-width: 767px) {
    min-width: 100%;
    max-width: 100%;
  }
`;

const Box = styled.div`
  display: flex;
  line-height: 1.4;
  flex-direction: column;
  align-items: center;
`;

const ContentBox = styled.div`
  margin-bottom: 1rem;
`;

const FlexRowBox = styled.div`
  ${flexRowBaseStyle}
`;

const Inner = styled(FlexRowBox)`
  width: 100%;
  margin-top: 1rem;
  justify-content: center;
  flex: 1;
`;

const DateBox = styled(FlexRowBox)`
  width: 100%;
  justify-content: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.gray2};
`;

const ContentTitle = styled.p`
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.gray5};
`;

const ChartWrapper = styled(FlexRowBox)`
  margin: 0 1.5rem;
`;

const Content = styled.div`
  font-size: 1.05rem;
`;

const ScoreBox = styled.div``;

const Score = styled.div`
  ${flexRowCenteredStyle}
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 5px solid ${(props) => props.color};
  font-size: 1.3rem;
  font-weight: 500;
  color: ${(props) => props.color};
`;

const ScoreText = styled.p`
  margin-bottom: 0.25rem;
  font-weight: 500;
  text-align: center;
`;
