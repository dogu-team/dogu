import { DoguDocsUrl } from '../../../utils/url';
import DocumentCard from '../DocumentCard';
import GuideStep from '../GuideStep';

interface Props {
  id: string;
}

const DoneStep = ({ id }: Props) => {
  return (
    <GuideStep
      id={id}
      title="Done! Next step 🚀"
      content={
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <DocumentCard
            title="📝 CI integration"
            description="Would you like to integrate routines with CI tools like GitHub Action and Jenkins?"
            url={DoguDocsUrl.integration.cicd['github-action']()}
          />
          <DocumentCard
            title="📝 About organization"
            description="Explore features for organization. ie) Git integration, App management"
            url={DoguDocsUrl.management.organization._index()}
          />
          <DocumentCard
            title="📝 Test automation"
            description="More information about test automation"
            url={DoguDocsUrl['test-automation']._index()}
          />
          <DocumentCard
            title="📝 Test report"
            description="More information about test report"
            url={DoguDocsUrl['test-report']._index()}
          />
        </div>
      }
    />
  );
};

export default DoneStep;
