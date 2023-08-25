import React, { useEffect } from 'react';
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
import IntegrationLogo from '@site/static/img/main/integration.svg';
import initLiveChat from '../livechat/livechat';

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
              <p className={styles.headerBannerFontColor}>Get started</p>
            </Link>
            <Link
              href="https://dogutech.io"
              target="_blank"
              className={styles.headerBannerButton}
            >
              <p className={styles.headerBannerFontColor}>Try Dogu for free</p>
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

  useEffect(() => {
    initLiveChat();
  }, []);

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
              <Link to="/device-farm/host">
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
              <Link to="/test-automation/selenium">
                <Translate id="main.testAutomationSeleniumLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-automation/appium">
                <Translate id="main.testAutomationAppiumLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-automation/gamium">
                <Translate id="main.testAutomationGamiumLinkTitle" />
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
              <Link to="/test-report/jest">Jest</Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/test-report/pytest">Pytest</Link>
            </li>
            {/* <li className={styles.docsSectionListItem}>
              <Link to="/test-report/testng">TestNG</Link>
            </li> */}
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
              <IntegrationLogo className={styles.svg} />
            </div>
            <Translate id="main.integration" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/integration/cicd/github-action">Github Action</Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/integration/cicd/jenkins">Jenkins</Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/integration/notification/slack">Slack</Link>
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
              <Link to="https://join.slack.com/t/dogu-community/shared_invite/zt-1zespy16o-TgYIureSBI6ma6o_nG3gVw">
                Slack
              </Link>
            </li>
          </ul>
        </div>
      </main>
    </Layout>
  );
}
