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
          <GuideStep id="" title="Connect host" description="Connect host..." content={<p>Follow tutorial documentation!</p>} />
          <GuideStep id="" title="Option1: use as host device" description="Host device..." content={<p>Follow tutorial documentation!</p>} />
          <GuideStep id="" title="Option2: connect mobile device" description="Device....." content={<p>Follow tutorial documentation!</p>} />
        </div>
      }
    />
  );
};

export default DeviceFarmTutorial;
