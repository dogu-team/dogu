import RefreshButton from '../../../../../../src/components/buttons/RefreshButton';
import TableListView from '../../../../../../src/components/common/TableListView';
import ProjectLayoutWithSidebar from '../../../../../../src/components/layouts/ProjectLayoutWithSidebar';
import CaseListController from '../../../../../../src/enterprise/components/record/CaseListController';
import { getRecordTestCaseServerSideProps, RecordTestCasePageProps } from '../../../../../../src/enterprise/pages/record';
import { NextPageWithLayout } from '../../../../../_app';

const RecordTestingCasePage: NextPageWithLayout<RecordTestCasePageProps> = ({ organization, project, me }) => {
  return (
    <TableListView
      top={
        <div>
          <RefreshButton />
        </div>
      }
      table={<CaseListController organizationId={organization.organizationId} projectId={project.projectId} />}
    />
  );
};

RecordTestingCasePage.getLayout = (page) => {
  return <ProjectLayoutWithSidebar titleI18nKey="Record Testing">{page}</ProjectLayoutWithSidebar>;
};

export const getServerSideProps = getRecordTestCaseServerSideProps;

export default RecordTestingCasePage;
