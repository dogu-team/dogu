import { JobSchema, ROUTINE_JOB_NAME_MAX_LENGTH } from '@dogu-private/types';
import { Switch, Tag } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { Handle, NodeProps, Position } from 'reactflow';
import styled from 'styled-components';

export type JobNodeData = {
  name: string;
  job: JobSchema;
};

const JobNode = ({ data, isConnectable }: NodeProps<JobNodeData>) => {
  const { name, job } = data;
  const { t } = useTranslation('routine');

  const runsOnGroup = typeof job['runs-on'] === 'object' && 'group' in job['runs-on'] ? job['runs-on'].group : [];

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: '1rem',
          height: '1rem',
          left: '-0.45rem',
        }}
      />
      <Box stepCounts={job.steps.length}>
        <JobNameWrapper>
          <JobName>{name}</JobName>
        </JobNameWrapper>
        {/* <Section>
          <SectionTitle>{t('routineGuiEditorJobDeviceLabel')}</SectionTitle>
          <TagContent>
            {typeof runsOnGroup === 'string' ? (
              <Tag color="pink">{runsOnGroup}</Tag>
            ) : (
              runsOnGroup.map((tag) => {
                return (
                  <Tag key={tag} color="pink">
                    {tag}
                  </Tag>
                );
              })
            )}
          </TagContent>
        </Section>
        <Section>
          <SectionTitle>{t('routineGuiEditorJobScreenRecordLabel')}</SectionTitle>
          <div>
            <Switch checked={job.record} />
          </div>
        </Section> */}
      </Box>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          width: '1rem',
          height: '1rem',
          right: '-0.45rem',
        }}
      />
    </>
  );
};

export default JobNode;

const Box = styled.div<{ stepCounts: number }>`
  position: relative;
  width: 400px;
  height: ${(props) => props.stepCounts * 64 + 128}px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${(props) => props.theme.colors.gray6};
  background-color: #9ef0a033;
  line-height: 1.4;
  overflow-y: auto;
`;

const JobNameWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const JobName = styled.div`
  font-weight: 600;
  font-size: 1.25rem;
`;

const Section = styled.div`
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const SectionTitle = styled.p`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const Content = styled.div``;

const TagContent = styled(Content)`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;
