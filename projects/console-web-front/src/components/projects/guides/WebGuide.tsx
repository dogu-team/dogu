import { Anchor, Steps } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Prism from 'prismjs';

import styled from 'styled-components';

const WebGuide = () => {
  const router = useRouter();

  return (
    <Box>
      <StickyBox>
        <Anchor
          affix={false}
          onClick={(e, c) => {
            e.preventDefault();
            router.push(c.href);
          }}
          items={[
            {
              key: '1',
              href: '#step-0',
              title: 'Step 1',
            },
            {
              key: '2',
              href: '#step-1',
              title: 'Step 2',
            },
            {
              key: '3',
              href: '#step-2',
              title: 'Step 3',
            },
            {
              key: '4',
              href: '#step-3',
              title: 'Step 4',
            },
          ]}
        />
      </StickyBox>
      <div>
        <div id="step-0">
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
        <div id="step-1">
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
        <div id="step-2">
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
        <div id="step-3">
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
      </div>
    </Box>
  );
};

export default WebGuide;

const Box = styled.div`
  display: flex;
`;

const StickyBox = styled.div`
  position: sticky;
  top: 0;
`;
