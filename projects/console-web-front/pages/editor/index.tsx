import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import Editor, { useMonaco, loader, Monaco } from '@monaco-editor/react';
import { useEffect, useState } from 'react';

const TeamDevicePage: NextPageWithLayout = () => {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2016,
        allowNonTsExtensions: true,
        allowJs: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        typeRoots: ['node_modules/@types'],
        lib: ['es2016', 'dom'],
        jsx: monaco.languages.typescript.JsxEmit.React,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        strict: true,
        noImplicitAny: true,
        noImplicitThis: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        forceConsistentCasingInFileNames: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitUseStrict: true,
        noEmitHelpers: true,
      });
    }
  }, [monaco]);

  return (
    <>
      <Head>
        <title>Cloud Devices | Dogu</title>
      </Head>
      <div>
        <Editor height="80vh" theme="vs-dark" path={'index.yaml'} language={'yaml'} defaultLanguage={'yaml'} defaultValue={''} />
      </div>
    </>
  );
};

TeamDevicePage.getLayout = (page) => {
  return <>{page}</>;
};

export default TeamDevicePage;

const TopWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  @media only screen and (max-width: 1023px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
