import useTranslation from 'next-translate/useTranslation';
import { DoguDocsUrl } from '../../../utils/url';
import DocumentCard from '../DocumentCard';
import GuideStep from '../GuideStep';

interface Props {
  id: string;
}

const DoneStep = ({ id }: Props) => {
  const { t } = useTranslation('tutorial');

  return (
    <GuideStep
      id={id}
      title={t('doneStepTitle')}
      content={
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <DocumentCard
            title="📝 About project"
            description="Explore features for project. ie) Git integration, App management"
            url={DoguDocsUrl.management.project._index()}
          />
          <DocumentCard
            title="📝 About routine"
            description="Would you like to automate more complex tests or integrate tests with CI?"
            url={DoguDocsUrl.routine.routines._index()}
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
