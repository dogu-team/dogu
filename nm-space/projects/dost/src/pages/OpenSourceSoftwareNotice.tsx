import PageTitle from '../components/layouts/PageTitle';
import SinglePageLayout from '../components/layouts/SinglePageLayout';
import { Button, Link, ListItem, Stack, Text, UnorderedList } from '@chakra-ui/react';
import { ipc } from '../utils/window';

interface OpenSourceSoftware {
  name: string;
  link: string;
  version?: string;
  codeLink?: string;
  licenseName: string;
  licenseLink: string;
}

function OpenSourceSoftwareNotice() {
  return (
    <SinglePageLayout title={<PageTitle title="Open Source Software Notice" closable />}>
      <Stack spacing="15px">
        {softwares.map((software) => {
          return (
            <div key={software.name}>
              <Button
                size="lg"
                variant="link"
                minWidth={0}
                onClick={() => {
                  ipc.settingsClient.openExternal(software.link);
                }}
                width="max-content"
              >
                {software.name}
              </Button>

              <UnorderedList>
                {software.version && (
                  <ListItem>
                    <Text>version: {software.version}</Text>
                  </ListItem>
                )}
                {software.codeLink && (
                  <ListItem>
                    code:&nbsp;
                    <Button
                      variant="link"
                      onClick={() => {
                        ipc.settingsClient.openExternal(software.codeLink!);
                      }}
                      width="max-content"
                    >
                      {software.codeLink}
                    </Button>
                  </ListItem>
                )}
                <ListItem>
                  license: {software.licenseName}&nbsp;
                  <Button
                    variant="link"
                    onClick={() => {
                      ipc.settingsClient.openExternal(software.licenseLink);
                    }}
                    width="max-content"
                  >
                    {software.licenseLink}
                  </Button>
                </ListItem>
              </UnorderedList>
            </div>
          );
        })}
      </Stack>
    </SinglePageLayout>
  );
}

export default OpenSourceSoftwareNotice;

const softwares: OpenSourceSoftware[] = [
  {
    name: 'adb-join-wifi',
    link: 'https://github.com/steinwurf/adb-join-wifi',
    version: '1.0.1',
    codeLink: 'https://github.com/steinwurf/adb-join-wifi/tree/1.0.1',
    licenseName: 'BSD 3-Clause',
    licenseLink: 'https://github.com/steinwurf/adb-join-wifi/blob/1.0.1/LICENSE.rst',
  },
  {
    name: 'appium',
    link: 'https://appium.io/',
    version: '2.0.0',
    codeLink: 'https://www.npmjs.com/package/appium/v/2.0.0?activeTab=code',
    licenseName: 'Apache License 2.0',
    licenseLink: 'https://github.com/appium/appium/blob/master/LICENSE',
  },
  {
    name: 'ffmpeg',
    link: 'https://ffmpeg.org/',
    version: '6.0-tessus',
    codeLink: 'https://git.ffmpeg.org/gitweb/ffmpeg.git/tree/refs/heads/release/6.0',
    licenseName: 'LGPL v2.1+',
    licenseLink: 'https://git.ffmpeg.org/gitweb/ffmpeg.git/blob/refs/heads/release/6.0:/LICENSE.md',
  },
  {
    name: 'git',
    link: 'https://git-scm.com/',
    version: '2.39.3',
    codeLink: 'https://github.com/git/git/tree/v2.39.3',
    licenseName: 'GPL v2',
    licenseLink: 'https://github.com/git/git/blob/v2.39.3/COPYING',
  },
  {
    name: 'libimobiledevice',
    link: 'https://libimobiledevice.org/',
    version: '1.0.6',
    codeLink: 'https://github.com/libimobiledevice/libimobiledevice/tree/1.0.6',
    licenseName: 'LGPL v2.1',
    licenseLink: 'https://github.com/libimobiledevice/libimobiledevice/blob/1.0.6/COPYING',
  },
  {
    name: 'mobiledevice',
    link: 'https://github.com/imkira/mobiledevice',
    version: '2.0.0',
    codeLink: 'https://github.com/imkira/mobiledevice/releases/tag/v2.0.0',
    licenseName: 'MIT License',
    licenseLink: 'https://github.com/imkira/mobiledevice/blob/v2.0.0/LICENSE',
  },
  {
    name: 'node',
    link: 'https://nodejs.org',
    version: '16.20.0',
    codeLink: 'https://github.com/nodejs/node/tree/v16.20.0',
    licenseName: 'MIT License',
    licenseLink: 'https://github.com/nodejs/node/blob/v16.20.0/LICENSE',
  },
  {
    name: 'zlib',
    link: 'https://zlib.net/',
    version: '1.2.13',
    codeLink: 'https://www.zlib.net/zlib-1.2.13.tar.gz',
    licenseName: 'zlib license',
    licenseLink: 'https://zlib.net/zlib_license.html',
  },
  {
    name: 'scrcpy',
    link: 'https://github.com/Genymobile/scrcpy',
    licenseName: 'Apache License 2.0',
    licenseLink: 'https://github.com/Genymobile/scrcpy/blob/master/LICENSE',
  },
];
