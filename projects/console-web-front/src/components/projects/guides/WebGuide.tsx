import { Anchor } from 'antd';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import styled from 'styled-components';
import { CopyButtonContainerProps } from './CopyButtonContainer';
// @ts-ignore
const CopyButtonContainer = dynamic<CopyButtonContainerProps>(() => import('./CopyButtonContainer'), { ssr: false, loading: () => <div>Loading...</div> });

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
              href: '#sample-prioject-setup',
              title: 'Sample project setup',
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
      <GuideBox>
        <Step id="sample-prioject-setup">
          <StepTitle>Sample project setup</StepTitle>
          <div>
            <p>Clone sample repository.</p>
            <div>
              <CopyButtonContainer language="bash" code={`git clone https://github.com/dogu-team/dogu-sample.git`} />
              <CopyButtonContainer language="bash" code={`cd dogu-sample`} />
            </div>
          </div>
        </Step>
        <Step id="step-1">
          <StepTitle>Set capabilities</StepTitle>
          <div>
            <p>어쩌고 저쩌고....</p>
            <div>
              <CopyButtonContainer
                language="javascript"
                code={`{
  capabilities: {
      alwaysMatch: {
          'dogu:options': {
              organizationId: string
              projectId: string
              accessKey: string

              runs-on: android // ignore case
              // runs-on: string | string[] | { group: string | string[] }

              browserName: string | undefined
              browserVersion: string | undefined
          }
      }
  }
}
`}
              />
            </div>
          </div>
        </Step>
        <Step id="step-2">
          <StepTitle>Sample project setup</StepTitle>
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
        </Step>
        <Step id="step-3">
          <StepTitle>Sample project setup</StepTitle>
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
        </Step>
      </GuideBox>
    </Box>
  );
};

export default WebGuide;

const Box = styled.div`
  display: flex;
`;

const StickyBox = styled.div`
  width: 20%;
  position: sticky;
  top: 0;
`;

const GuideBox = styled.div`
  width: 80%;
  margin-left: 1rem;
  max-width: 1000px;
`;

const Step = styled.div`
  margin-bottom: 2rem;
`;

const StepTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
`;
