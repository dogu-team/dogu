import DocumentCard from './DocumentCard';
import GuideStep from './GuideStep';

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
            title="📝 About project"
            description="Explore features for project. ie) Git integration, App management"
            url="https://docs.dogutech.io/management/project"
          />
          <DocumentCard
            title="📝 About routine"
            description="Would you like to automate more complex tests or integrate tests with CI?"
            url="https://docs.dogutech.io/routine/routines"
          />
          <DocumentCard title="📝 Test automation" description="More information about test automation" url="https://docs.dogutech.io/test-automation" />
          <DocumentCard title="📝 Test report" description="More information about test report" url="https://docs.dogutech.io/test-report" />
        </div>
      }
    />
  );
};

export default DoneStep;
