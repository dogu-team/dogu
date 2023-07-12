import { Button } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

import DoneStep from './DoneStep';
import GuideAnchor from './GuideAnchor';
import GuideLayout from './GuideLayout';
import GuideStep from './GuideStep';

const TUTORIAL_DOCS_ID = 'tutorial-docs';
const DONE_ID = 'done';

const WebGuide = () => {
  const router = useRouter();

  return (
    <GuideLayout
      sidebar={
        <GuideAnchor
          items={[
            { id: TUTORIAL_DOCS_ID, title: 'Tutorial document' },
            { id: DONE_ID, title: 'Done! Next step' },
          ]}
        />
      }
      content={
        <div>
          <GuideStep
            id={TUTORIAL_DOCS_ID}
            title="Tutorial document"
            description={<p>Follow the tutorial document</p>}
            content={
              <Link href="https://docs.dogutech.io/get-started/tutorials/web/python/using-pytest-and-playwright" target="blank">
                <Button>Visit document</Button>
              </Link>
            }
          />
          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default WebGuide;
