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
            <Translate id="main.getStartedTitle" />
          </h2>
          <ul className={styles.docsSectionListContainer}>
            <li className={styles.docsSectionListItem}>
              <Link to="/get-started/introduction">
                <Translate id="main.getStartedAboutLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/get-started/device-farm">
                <Translate id="main.getStartedDevicefarmLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/get-started/game-test">
                <Translate id="main.getStartedGameTestLinkTitle" />
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
              <Link to="/organization-and-project/organization/about">
                <Translate id="main.orgAndProjectOrgLinkTitle" />
              </Link>
            </li>
            <li className={styles.docsSectionListItem}>
              <Link to="/organization-and-project/project/about">
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
        <div className={styles.docsSection}>
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
        </div>
        <div className={styles.docsSection}>
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
              <Link to="/community/discord">Discord</Link>
            </li>
          </ul>
        </div>
      </main>
    </Layout>
  );
}
