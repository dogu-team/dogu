<p align="center">
<img src=".github/resources/logo.png" width="100px" height="100px" title="Gamium_Logo"/>
</p>
<p align="center">
  <b>Dogu</b>
</p>
<p align="center">
Dogu is an integrated platform for automated testing - TestOps
</p>
<p align="center">
<a href="https://dogutech.io" target="_blank" rel="noopener noreferrer">Homepage</a> | 
<a href="https://twitter.com/dogutechio" target="_blank" rel="noopener noreferrer">Twitter</a> |
<a href="https://discord.gg/bVycd6Tu9g" target="_blank" rel="noopener noreferrer">Discord</a>
</p>

## What is Dogu?

Dogu is an platform which integrates device-farm, CI, test-reporting for automated testing.  
If you use Dogu then you don't need to set up platform like jenkins, device-farm, test-reporting for automated test to Dogu and focus on your test.

## Architecture

<img src=".github/resources/architecture.png"/>

- [Gamium](https://github.com/dogu-team/gamium) - SDK that allows you to automate game developed by Unity Engine.

## Features

### [Organization & Project](https://docs.dogutech.io/organization-and-project/introduction)

Manage project, user, device, test script, workflow according to role of organization

<div style="display: flex; flex-direction: row; margin-bottom: 8px">
  <img src=".github/resources/organization-member.png" width="49%"/>
  <img src=".github/resources/organization-team.png" width="49%"/>
</div>

### [Host & Device](https://docs.dogutech.io/host-and-device/introduction)

Build device farm with your own devices

<div style="display: flex; flex-direction: row; margin-bottom: 8px">
  <img src=".github/resources/host.png" width="49%"/>
  <img src=".github/resources/host-streaming.png" width="49%"/>
</div>
<div style="display: flex; flex-direction: row;">
  <img src=".github/resources/device.png" width="49%"/>
<img src=".github/resources/device-streaming.png" width="49%"/>
</div>

### [Script & Workflow](https://docs.dogutech.io/script-and-routine/introduction)

Integrate test script with workflow and run it on your own device farm

<div style="display: flex; flex-direction: row;">
  <img src=".github/resources/workflow-outside.png" width="49%"/>
  <img src=".github/resources/workflow-inside.png" width="49%"/>
</div>

### [Testing Report](https://docs.dogutech.io/script-and-routine/report)

Visualize test result from workflow

- Profiling device (memory, cpu, fps)
- Recording video
- Visualize test result (test unit)
- Testing script log

<div style="display: flex; flex-direction: row; margin-bottom: 8px">
  <img src=".github/resources/reporting-video.png" width="49%"/>
  <img src=".github/resources/reporting-profiling.png" width="49%"/>
</div>
<div style="display: flex; flex-direction: row;">
  
  <img src=".github/resources/reporting-visualization.png" width="49%"/>
  <img src=".github/resources/reporting-testing-profiling.png" width="49%"/>
</div>

## Hardware requirements

<p style="font-size:18px;">Main Server</p>

|                          | Minimum Requirements   |
| :----------------------: | ---------------------- |
| <b>Operating System</b>  | OS that can run docker |
|       <b> CPU </b>       | 16 Cores               |
|     <b> Memory </b>      | 32 Gb RAM              |
| <b> Free Disk Space </b> | SSD 128Gb              |

<p style="font-size:18px;">Host</p>

|                          | Minimum Requirements |
| :----------------------: | -------------------- |
| <b>Operating System</b>  | Windows, MacOS       |
|       <b> CPU </b>       | 4 Cores              |
|     <b> Memory </b>      | 8 Gb RAM             |
| <b> Free Disk Space </b> | SSD 32Gb             |

## Getting Started (Self-Managed)

We are preparing to make Dogu be open-source project.

## Getting Started (SaaS)

You can start without setting up Dogu by using our [cloud service](https://dogutech.io)

## Resources

[Documentation](https://docs.dogutech.io)
