import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';

import styles from './index.module.css';
import RocketLogo from '@site/static/img/main/rocket.svg';
import DeviceLogo from '@site/static/img/main/device.svg';
import CodeLogo from '@site/static/img/main/code.svg';
import RoutineLogo from '@site/static/img/main/routine.svg';
import OrgLogo from '@site/static/img/main/organization.svg';
import CommunityLogo from '@site/static/img/main/community.svg';
import SelfManagedLogo from '@site/static/img/main/self-managed.svg';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <section className={styles.headerBanner}>
      <div className={styles.headerBannerInner}>
        <h1 className={styles.headerBannerTitle}>{siteConfig.title}</h1>
        <p className={styles.headerBannerDescription}>
          <Translate id="main.descriptionText" />
        </p>

        <iframe
          src="https://ghbtns.com/github-btn.html?user=dogu-team&amp;repo=dogu&amp;type=star&amp;count=true&amp;size=large"
          width="160"
          height="30"
          title="GitHub Stars"
        ></iframe>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`Home`}
      description="Documentation for Dogu, game test automation service."
    >
      <HomepageHeader />
      <main className={styles.docsMain}>
        <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <RocketLogo className={styles.svg} />
            </div>
            <Translate id="main.introduction" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/introduction/dogu">
                <Translate id="main.getStartedAboutLinkTitle" />
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <RocketLogo className={styles.svg} />
            </div>
            <Translate id="main.getStartedTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/get-started/introduction">
                <Translate id="main.getStartedLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/get-started/dogu-cloud">
                <Translate id="main.getStartedWithCloud" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/get-started/dogu-self-hosted">
                <Translate id="main.getStartedWithSelfHosted" />
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <OrgLogo className={styles.svg} />
            </div>
            <Translate id="main.orgAndProjectTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/organization-and-project/introduction">
                <Translate id="main.orgAndProjectIntroLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/organization-and-project/organization">
                <Translate id="main.orgAndProjectOrgLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/organization-and-project/project">
                <Translate id="main.orgAndProjectProjectLinkTitle" />
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <DeviceLogo className={styles.svg} />
            </div>
            <Translate id="main.hostAndDeviceTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/host-and-device/introduction">
                <Translate id="main.hostAndDeviceIntroLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/host-and-device/host/get-started">
                <Translate id="main.hostAndDeviceHostLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/host-and-device/device/settings">
                <Translate id="main.hostAndDeviceDeviceLinkTitle" />
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <CommunityLogo className={styles.svg} />
            </div>
            <Translate id="main.testAutomationTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-automation/introduction">
                <Translate id="main.testAutomationTitle" />
              </Link>
            </li>
          </ul>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-automation/browser">
                <Translate id="main.testAutomationBrowserLinkTitle" />
              </Link>
            </li>
          </ul>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-automation/mobile">
                <Translate id="main.testAutomationMobileLinkTitle" />
              </Link>
            </li>
          </ul>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-automation/game">
                <Translate id="main.testAutomationGameLinkTitle" />
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <CommunityLogo className={styles.svg} />
            </div>
            <Translate id="main.testReportTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-report/introduction">
                <Translate id="main.testReportTitle" />
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <RoutineLogo className={styles.svg} />
            </div>
            <Translate id="main.scriptAndRoutineTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/script-and-routine/introduction">
                <Translate id="main.scriptAndRoutineIntroLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/script-and-routine/test-script/about">
                <Translate id="main.scriptAndRoutineScriptLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/script-and-routine/routine/about">
                <Translate id="main.scriptAndRoutineRoutineLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/script-and-routine/report">
                <Translate id="main.scriptAndRoutineReportLinkTitle" />
              </Link>
            </li>
          </ul>
        </div>
        {/* <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <CodeLogo className={styles.svg} />
            </div>
            GamiumKit
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/toolkit/introduction">
                <Translate id="main.gamiumIntroLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/toolkit/quick-start">
                <Translate id="main.gamiumStartLinkTitle" />
              </Link>
            </li>
          </ul>
        </div> */}
        {/* <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <SelfManagedLogo className={styles.svg} />
            </div>
            <Translate id="main.selfHostedTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/self-hosted/get-started">
                <Translate id="main.selfHostedStartLinkTitle" />
              </Link>
            </li>
          </ul>
        </div> */}
        <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <CommunityLogo className={styles.svg} />
            </div>
            <Translate id="main.communityTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="https://discord.com/invite/bVycd6Tu9g">Discord</Link>
            </li>
          </ul>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="https://github.com/dogu-team/dogu/discussions">
                Github Discussion
              </Link>
            </li>
          </ul>
        </div>
      </main>
    </Layout>
  );
}
