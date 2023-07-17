import GuideAnchor from '../projects/guides/GuideAnchor';
import GuideLayout from '../projects/guides/GuideLayout';
import GuideStep from '../projects/guides/GuideStep';

const DeviceFarmTutorial = () => {
  return (
    <GuideLayout
      sidebar={
        <div>
          <GuideAnchor items={[]} />
        </div>
      }
      content={
        <div>
          <GuideStep id="" title="Create your project" description="Create project..." content={<p>Follow tutorial documentation!</p>} />
        </div>
      }
    />
  );
};

export default DeviceFarmTutorial;
