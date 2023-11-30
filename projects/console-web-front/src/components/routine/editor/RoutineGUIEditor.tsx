import { JobSchema, PROJECT_TYPE } from '@dogu-private/types';
import React, { createContext, useCallback } from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import useRoutineEditorStore from '../../../stores/routine-editor';
import JobContainer from './gui/JobContainer';
import RoutineNameEditor from './gui/RoutineNameEditor';
import { RUN_TEST_ACTION_NAME } from '../../../types/routine';
import { CLOUD_LINUX_DEVICE_NAME } from '../../../resources/routine';
import { IS_CLOUD } from '../../../../pages/_app';
import RepositorySelector from './gui/RepositorySelector';

interface Props {
  projectType: PROJECT_TYPE;
  hideAddButton?: boolean;
}

export const RoutineProjectTypeContext = createContext<PROJECT_TYPE>(PROJECT_TYPE.CUSTOM);

const RoutineGUIEditor = ({ projectType, hideAddButton }: Props) => {
  const [schema, updateSchema] = useRoutineEditorStore((state) => [state.schema, state.updateSchema]);
  const { t } = useTranslation();

  const getNewJob = (index: number): { [k: string]: JobSchema } => {
    // if (IS_CLOUD) {
    //   return {
    //     [`new-job-${index}`]: {
    //       'runs-on': projectType === PROJECT_TYPE.WEB ? CLOUD_LINUX_DEVICE_NAME : { group: [] },
    //       ...(projectType === PROJECT_TYPE.WEB ? { browserName: 'chrome' } : {}),
    //       steps: [{ name: 'run-test', uses: RUN_TEST_ACTION_NAME, with: {} }],
    //     },
    //   };
    // }

    return {
      [`new-job-${index}`]: {
        'runs-on': projectType === PROJECT_TYPE.WEB ? [] : { group: [] },
        ...(projectType === PROJECT_TYPE.WEB ? { browserName: 'chrome' } : {}),
        steps: [{ name: 'run-test', uses: RUN_TEST_ACTION_NAME, with: {} }],
      },
    };
  };

  const handleAddJob = () => {
    const jobNames = Object.keys(schema.jobs);
    const newJobNames = jobNames.filter((name) => name.match(/^new-job-[0-9]{1,}$/));
    const newIndex =
      newJobNames.length > 0 ? Math.max(...newJobNames.map((name) => Number(name.split('-')[2]))) + 1 : 1;

    updateSchema({
      ...schema,
      jobs: {
        ...schema.jobs,
        ...getNewJob(newIndex),
      },
    });
  };

  const handleUpdateJob = useCallback(
    (job: JobSchema, name: string) => {
      const names = Object.keys(schema.jobs);

      const newJobs: { [key: string]: JobSchema } = {};

      names.forEach((jobName) => {
        if (jobName === name) {
          newJobs[jobName] = job;
        } else {
          newJobs[jobName] = schema.jobs[jobName];
        }
      });

      updateSchema({ ...schema, jobs: newJobs });
    },
    [schema],
  );

  const handleUpdateJobName = useCallback(
    (originName: string, newName: string) => {
      const jobs = schema.jobs;
      const names = Object.keys(jobs);

      if (names.includes(newName)) {
        alert('Job name already exists');
        return;
      }

      const index = names.indexOf(originName);
      const newNames = [...names.slice(0, index), newName, ...names.slice(index + 1)];
      const newJobs: { [key: string]: JobSchema } = {};

      newNames.forEach((n) => {
        if (n === newName) {
          newJobs[newName] = jobs[originName];
        } else {
          // update needs
          const needs = jobs[n].needs;
          if (needs) {
            if (typeof needs === 'string') {
              if (jobs[n].needs === originName) {
                newJobs[n] = { ...jobs[n], needs: newName };
              } else {
                newJobs[n] = jobs[n];
              }
            } else {
              if (needs.includes(originName)) {
                newJobs[n] = {
                  ...jobs[n],
                  needs: needs.map((need) => (need === originName ? newName : need)),
                };
              } else {
                newJobs[n] = jobs[n];
              }
            }
          } else {
            newJobs[n] = jobs[n];
          }
        }
      });

      updateSchema({ ...schema, jobs: newJobs });
    },
    [schema],
  );

  const handleDeleteJob = useCallback(
    (name: string) => {
      const jobs = schema.jobs;
      const names = Object.keys(jobs);

      const index = names.indexOf(name);
      const newNames = [...names.slice(0, index), ...names.slice(index + 1)];
      const newJobs: { [key: string]: JobSchema } = {};

      newNames.forEach((n) => {
        // update needs
        const needs = jobs[n].needs;
        if (needs) {
          if (typeof needs === 'string') {
            if (jobs[n].needs === name) {
              newJobs[n] = { ...jobs[n], needs: [] };
            } else {
              newJobs[n] = jobs[n];
            }
          } else {
            if (needs.includes(name)) {
              newJobs[n] = { ...jobs[n], needs: needs.filter((need) => need !== name) };
            } else {
              newJobs[n] = jobs[n];
            }
          }
        } else {
          newJobs[n] = jobs[n];
        }
      });

      updateSchema({ ...schema, jobs: newJobs });
    },
    [schema],
  );

  const handleUpdateJobOrder = useCallback(
    (name: string, direction: 'up' | 'down') => {
      const names = Object.keys(schema.jobs);
      const index = names.indexOf(name);

      if (direction === 'up' && index === 0) {
        return;
      }

      if (direction === 'down' && index === names.length - 1) {
        return;
      }

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const newNames = [...names.slice(0, index), ...names.slice(index + 1)];
      newNames.splice(newIndex, 0, name);

      const newJobs: { [key: string]: JobSchema } = {};

      newNames.forEach((n) => {
        newJobs[n] = schema.jobs[n];
      });

      updateSchema({ ...schema, jobs: newJobs });
    },
    [schema],
  );

  return (
    <RoutineProjectTypeContext.Provider value={projectType}>
      <Box>
        <RoutineNameEditor name={schema.name} onChange={(value) => updateSchema({ ...schema, name: value })} />
        <div style={{ marginBottom: '1rem' }}>
          <StyledTitle>Repository</StyledTitle>
          <RepositorySelector
            value={schema.repository}
            onChange={(value) => updateSchema({ ...schema, repository: value })}
            style={{ maxWidth: '250px', width: '100%' }}
            placeholder={'Select repository'}
          />
        </div>
        <StyledTitle>{t('routine:routineGuiEditorJobLabel')}</StyledTitle>
        <JobWrapper>
          {Object.keys(schema.jobs).map((jobName, i) => {
            return (
              <JobContainer
                key={`${jobName}-${i}`}
                name={jobName}
                job={schema.jobs[jobName]}
                updateJob={handleUpdateJob}
                updateJobName={handleUpdateJobName}
                deleteJob={handleDeleteJob}
                updateJobOrder={handleUpdateJobOrder}
                hideAddButton={hideAddButton}
              />
            );
          })}
          {!hideAddButton && (
            <AddJobButton onClick={handleAddJob}>{t('routine:routineGuiEditorAddJobButtonTitle')}</AddJobButton>
          )}
        </JobWrapper>
      </Box>
    </RoutineProjectTypeContext.Provider>
  );
};

export default RoutineGUIEditor;

const Box = styled.div`
  line-height: 1.4;
`;

const StyledTitle = styled.p`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const JobWrapper = styled.div`
  padding-left: 1rem;
`;

const AddJobButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #ffffff;
  border: 1px dashed ${(props) => props.theme.colorPrimary};
  color: ${(props) => props.theme.colorPrimary};
  border-radius: 0.5rem;
`;
