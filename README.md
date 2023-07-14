<p align="center">
<img src=".github/resources/logo.png" width="128px" height="128px" title="Gamium_Logo"/>
</p>
<p align="center">
Dogu - Integrated test automation platform based on web.
</p>

<p align="center">
  <a href="https://github.com/dogu-team/dogu/actions/workflows/ci-e2e.yml">
    <img src="https://github.com/dogu-team/dogu/actions/workflows/ci-e2e.yml/badge.svg" alt="GitHub Actions status">
  </a>
  <a href="https://github.com/dogu-team/dogu/releases" alt="Activity">
    <img alt="GitHub tag (latest SemVer pre-release)" src="https://img.shields.io/github/v/tag/dogu-team/dogu?label=release">
  </a>
  <a href="https://hub.docker.com/r/dogutechio/dogu/tags" alt="Activity">
    <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/dogutechio/dogu?label=downloads">
  </a>
  <a href="https://github.com/dogu-team/dogu/pulse" alt="Activity">
    <img src="https://img.shields.io/github/commit-activity/m/dogu-team/dogu" />
  </a>
  <a href="https://discord.gg/bVycd6Tu9g">
    <img src="https://dcbadge.vercel.app/api/server/bVycd6Tu9g?style=flat" />
  </a>
  <div align="center">
  <a href="https://blog.dogutech.io">
    <img src="https://img.shields.io/badge/blog-007396?style=for-the-badge&logo=ghost&logoColor=white" alt="Blog" />
  </a>
    <a href="https://www.linkedin.com/company/dogu-technologies">
      <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
    </a>
    <a href="https://twitter.com/dogutechio">
      <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter" />
    </a>
    <a href="https://github.com/dogu-team/dogu/discussions">
      <img src="https://img.shields.io/badge/Discussion-10A1D2?style=for-the-badge&logo=github&logoColor=white" alt="Github" />
    </a>
  </div>
</p>

Dogu is an integrated test automation platform that simplifies the automation of web, mobile, and game application testing.

## Why Dogu?

Building and maintaining infrastructure components such as Appium, OpenSTF, Jenkins, and Grafana for test automation requires significant time and effort. However, Dogu streamlines this process by providing an integrated platform for these infrastructures, allowing you to concentrate on test automation itself. Moreover, Dogu offers seamless integration with test scripts and frameworks, eliminating the need to develop infrastructure-related tasks such as parallel test execution and data transfer for test reporting.

## Device Farm

<img src=".github/resources/architecture-device-farm.png" width="100%"/>

### Remote Control

Control device remotely on web browser.

<div style="display: flex; flex-direction: row; margin-bottom: 8px">
  <img src=".github/resources/device-android-streaming.gif" width="49%"/>
  <img src=".github/resources/device-ios-streaming.gif" width="49%"/>
</div>

### UI Inspector

Inspect UI on web browser.

- Native UI
- Game UI developed by Unity Engine

<div style="display: flex; flex-direction: row; justify-content: center">
  <img src=".github/resources/android-inspecting.gif" width="49%" />
  <img src=".github/resources/ios-inspecting.gif" width="49%" />  
</div>

## Test Framework With Dogu

### Browser

- [Selenium](https://docs.dogutech.io/test-automation/browser/selenium)
- [Playwright](https://docs.dogutech.io/test-automation/browser/playwright)
- [Puppeteer](https://docs.dogutech.io/test-automation/browser/puppeteer)
- [Cypress](https://docs.dogutech.io/test-automation/browser/cypress)
- [Webdriverio](https://docs.dogutech.io/test-automation/browser/webdriverio)

### Mobile

- [Appium](https://docs.dogutech.io/test-automation/mobile/appium/)

### Game

- [Gamium](https://docs.dogutech.io/test-automation/game/gamium)

## Test Unit Framework With Test Report

Visualize test unit by integrating test unit framework with test report.

<div style="display: flex; flex-direction: row; justify-content: center">
  <img src=".github/resources/reporting-video.png" width="49%"/>
  <img src=".github/resources/reporting-visualization.png" width="49%"/>
</div>

<br/>

- [Jest](https://docs.dogutech.io/test-report/javascript/jest)
- [Pytest](https://docs.dogutech.io/test-report/python/pytest)
- [Mocha](https://docs.dogutech.io/test-report/javascript/mocha)
- [TestNG](https://docs.dogutech.io/test-report/java/testng)

## Routine Workflow

Run test script on routine and integrate external workflow with routine.

<img src=".github/resources/workflow-inside.png"/>

- Jenkins (Not yet supported)
- Github Action (Not yet supported)

## Start With Self-Hosted

Set up Dogu on your own server. See [Guide setting up Dogu with self-hosted](https://docs.dogutech.io/get-started/installation/self-hosted/)

## Start With Cloud

Start [Cloud Service](https://dogutech.io) right now without any installation.

## Documentation

- [Documentation](https://docs.dogutech.io)
- [Tutorial - Browser Test Automation](https://docs.dogutech.io/get-started/tutorials/web)
- [Tutorial - Mobile Test Automation](https://docs.dogutech.io/get-started/tutorials/app)
- [Tutorial - Game Test Automation](https://docs.dogutech.io/get-started/tutorials/game)

## Community Support

We love stars so make sure you star ⭐ us on GitHub.

- [Github Discussion](https://github.com/dogu-team/dogu/discussions) - Discussion about product and roadmap
- [Discord](https://discord.gg/bVycd6Tu9g) - Discussion with the community
- [Twitter](https://twitter.com/dogutechio) - Get the latest updates
- [LinkedIn](https://www.linkedin.com/company/dogu-technologies) - Get the latest team updates

## Contributing

Do you want to contribute to Dogu? We'd love your help. Dogu is an open source project, built one contribution at a time by users like you.
See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

We provide two editions of Dogu: Community Edition and Enterprise Edition.

See [LICENSE](LICENSE.md) for more details.
