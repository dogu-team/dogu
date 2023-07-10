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
import APILogo from '@site/static/img/main/api.svg';
import AutomationLogo from '@site/static/img/main/automation.svg';
import ReportLogo from '@site/static/img/main/report.svg';
import DoguLogo from '@site/static/img/main/dogu.svg';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <section className={styles.headerBanner}>
      <div className={styles.headerBannerInner}>
        <DoguLogo width={144} height={144} />
        <h1 className={styles.headerBannerTitle}>{siteConfig.title}</h1>
        <p className={styles.headerBannerDescription}>
          <Translate id="main.descriptionText" />
        </p>

        <div className={styles.headerBannerButtonWrapper}>
          <div className={styles.headerBannerButtonWrapper}>
            <Link to="/get-started" className={styles.headerBannerButton}>
              Get started
            </Link>
            <Link
              href="https://dogutech.io"
              target="_blank"
              className={styles.headerBannerButton}
            >
              Try Dogu for free
            </Link>
          </div>
          <iframe
            src="https://ghbtns.com/github-btn.html?user=dogu-team&amp;repo=dogu&amp;type=star&amp;count=true&amp;size=large"
            width="160"
            height="30"
            title="GitHub Stars"
          />
        </div>
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
            <Translate id="main.getStartedLinkTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/get-started">
                <Translate id="main.introduction" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/get-started/installation">
                <Translate id="main.getStartedInstallationTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/get-started/tutorials">
                <Translate id="main.getStartedTutorialTitle" />
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
              <Link to="/management">
                <Translate id="main.orgAndProjectIntroLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/management/organization">
                <Translate id="main.orgAndProjectOrgLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/management/project">
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
              <Link to="/device-farm">
                <Translate id="main.hostAndDeviceIntroLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/device-farm/host/get-started">
                <Translate id="main.hostAndDeviceHostLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/device-farm/device/settings">
                <Translate id="main.hostAndDeviceDeviceLinkTitle" />
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <AutomationLogo className={styles.svg} />
            </div>
            <Translate id="main.testAutomationTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-automation">
                <Translate id="main.testAutomationTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-automation/run">
                <Translate id="main.testAutomationRunLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-automation/browser">
                <Translate id="main.testAutomationBrowserLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-automation/mobile">
                <Translate id="main.testAutomationMobileLinkTitle" />
              </Link>
            </li>
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
              <ReportLogo className={styles.svg} />
            </div>
            <Translate id="main.testReportTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-report">
                <Translate id="main.testReportTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-report/javascript">Javascript</Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-report/python">Python</Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-report/java">Java</Link>
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
              <Link to="/routine/routines">
                <Translate id="main.scriptAndRoutineRoutineLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/routine/actions">
                <Translate id="main.scriptAndRoutineActionLinkTitle" />
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.docsSection}>
          <h2 className={styles.docsSectionTitle}>
            <div className={styles.logoWrapper}>
              <APILogo className={styles.svg} />
            </div>
            API
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/api">API</Link>
            </li>
          </ul>
        </div>
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
