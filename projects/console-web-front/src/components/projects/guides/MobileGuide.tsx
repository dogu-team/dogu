import { Steps } from 'antd';
import { useState } from 'react';

const MobileGuide = () => {
  const [current, setCurrent] = useState(0);

  return (
    <div>
      <div>
        <Steps
          current={current}
          onChange={(c) => setCurrent(c)}
          direction="vertical"
          items={[
            {
              title: 'Step 1',
            },
            {
              title: 'Step 2',
            },
            {
              title: 'Step 3',
            },
          ]}
        />
      </div>
      <div>
        <h3>Sample project setup</h3>
        <div>
          <p>Clone sample repository.</p>
          <div>
            <code>
              git clone https://github.com/dogu-team/dogu-sample.git
              <br />
              cd dogu-sample
            </code>
          </div>
        </div>
      </div>

      <div>Setup your capabilities</div>
    </div>
  );
};

export default MobileGuide;
