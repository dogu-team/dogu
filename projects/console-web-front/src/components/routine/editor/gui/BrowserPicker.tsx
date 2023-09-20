import axios from 'axios';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { VersionItem } from '../../../../../pages/api/browsers/[browser]/available-versions';
import resources from '../../../../resources/index';
import { flexRowBaseStyle, flexRowCenteredStyle } from '../../../../styles/box';
import BrowserStatusTag from './BrowserStatusTag';

interface Props {
  browserName: string | undefined;
  browserVersion: string | undefined;
  onChange: (browserName: string | undefined, browserVersion: string | undefined) => void;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const BrowserPicker: React.FC<Props> = ({ browserName, browserVersion, onChange }) => {
  const { data, isLoading, error } = useSWR<VersionItem[]>(
    browserName &&
      `/api/browsers/${browserName}/available-versions${
        process.env.NEXT_PUBLIC_ENV === 'production' ? '?linuxOnly=true' : ``
      }`,
    fetcher,
  );
  const versionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (versionRef.current && browserVersion) {
      const versionButton = versionRef.current.querySelector(`[data-version="${browserVersion}"]`) as HTMLButtonElement;

      if (versionButton) {
        versionRef.current.scrollTo({
          top: versionButton.offsetTop - versionRef.current.offsetTop,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  const handleClickBrowser = (name: string) => {
    onChange(name, undefined);
  };

  const handleClickVersion = (version: string | undefined) => {
    onChange(browserName, version);
  };

  const latestVersion = data?.find((item) => item.status === 'latest')?.version;

  return (
    <Box>
      <BrowserWrapper>
        <TitleWrapper>
          <StyledTitle>Browsers</StyledTitle>
        </TitleWrapper>
        <BrowserButton isSelected={browserName === 'chrome'} onClick={() => handleClickBrowser('chrome')}>
          <Image src={resources.icons.chrome} width={24} height={24} alt="Chrome" style={{ marginRight: '.5rem' }} />
          Chrome
        </BrowserButton>
        <BrowserButton isSelected={browserName === 'firefox'} onClick={() => handleClickBrowser('firefox')}>
          <Image src={resources.icons.firefox} width={24} height={24} alt="Firefox" style={{ marginRight: '.5rem' }} />
          Firefox
        </BrowserButton>
        <BrowserButton isSelected={browserName === 'edge'} onClick={() => handleClickBrowser('edge')}>
          <Image src={resources.icons.edge} width={24} height={24} alt="Edge" style={{ marginRight: '.5rem' }} />
          Edge
        </BrowserButton>
      </BrowserWrapper>
      <div>
        <TitleWrapper>
          <StyledTitle>Versions</StyledTitle>
        </TitleWrapper>
        <VersionWrapper ref={versionRef}>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <VersionButton isSelected={!browserVersion} onClick={() => handleClickVersion(undefined)}>
                Latest{!!latestVersion && <b>{`(${latestVersion})`}</b>}
              </VersionButton>

              {data?.map((item) => {
                return (
                  <VersionButton
                    key={item.version}
                    isSelected={item.version === browserVersion}
                    onClick={() => handleClickVersion(item.version)}
                    data-version={item.version}
                  >
                    {item.version}
                    <BrowserStatusTag status={item.status} />
                  </VersionButton>
                );
              })}
            </>
          )}
        </VersionWrapper>
      </div>
    </Box>
  );
};

export default BrowserPicker;

const Box = styled.div`
  display: flex;
  line-height: 1.5;
`;

const BrowserWrapper = styled.div`
  width: 120px;
  margin-right: 3rem;
`;

const VersionWrapper = styled.div`
  width: 120px;
  max-height: 300px;
  overflow: auto;
`;

const StyledButton = styled.button<{ isSelected: boolean }>`
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
  background-color: ${(props) => (props.isSelected ? `${props.theme.colorPrimary}22` : '#ffffff')};
  border: 1px solid ${(props) => (props.isSelected ? props.theme.colorPrimary : 'transparent')};
  border-radius: 2rem;

  &:hover {
    background-color: ${(props) => props.theme.colorPrimary}22;
  }
`;

const BrowserButton = styled(StyledButton)`
  ${flexRowBaseStyle}
`;

const VersionButton = styled(StyledButton)`
  ${flexRowCenteredStyle}
  font-size: 0.8rem;

  b {
    font-size: 0.7rem;
    margin-left: 0.25rem;
  }
`;

const TitleWrapper = styled.div`
  margin: 1rem 0;
`;

const StyledTitle = styled.p`
  font-size: 0.85rem;
  color: #999999;
  line-height: 1.5;
  text-align: center;
`;
