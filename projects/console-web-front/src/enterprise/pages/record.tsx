import { OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';

import { getOrganizationInServerSide } from '../../api/organization';
import { getProjectInServerSide } from '../../api/project';
import { getUserInServerSide } from '../../api/registery';
import { getFeatureConfigInServerSide } from '../api/feature';

export interface RecordTestCasePageProps {
  organization: OrganizationBase;
  project: ProjectBase;
  me: UserBase;
}

export const getRecordTestCaseServerSideProps: GetServerSideProps<RecordTestCasePageProps> = async (context) => {
  try {
    const [organization, project, user, featureConfig] = await Promise.all([
      getOrganizationInServerSide(context),
      getProjectInServerSide(context),
      getUserInServerSide(context),
      getFeatureConfigInServerSide(context),
    ]);

    return {
      props: {
        organization,
        project,
        me: user,
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
};
