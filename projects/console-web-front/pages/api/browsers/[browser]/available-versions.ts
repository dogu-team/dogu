import axios from 'axios';
import { NextApiHandler } from 'next';

const AVAILABLE_BROSEWRS = ['chrome', 'firefox', 'edge'];

export type ChromeAvailablePlatform = 'linux64' | 'mac-arm64' | 'mac-x64' | 'win32' | 'win64';

export interface ChromeResponse {
  timestamp: string;
  versions: {
    version: string;
    revision: string;
    downloads: {
      chrome?: {
        platform: ChromeAvailablePlatform;
        url: string;
      }[];
      chromedriver?: {
        platform: ChromeAvailablePlatform;
        url: string;
      }[];
    };
  }[];
}

export type ChromeChannelKey = 'Stable' | 'Beta' | 'Dev' | 'Canary';

export interface ChromeChannelResponse {
  timestamp: string;
  channels: {
    [key in ChromeChannelKey]: {
      channel: ChromeChannelKey;
      version: string;
      revision: string;
    };
  };
}

export interface FirefoxResponse {
  releases: {
    [key: string]: {
      build_number: number;
      category: 'major' | 'dev' | 'esr';
      date: string;
      version: string;
    };
  };
}

export type EdgeAvailablePlatform = 'Windows' | 'MacOS' | 'Linux';
export type EdgeAvailableArchitecture = 'x64' | 'x86' | 'arm64' | 'universal';

export interface EdgeResponseItem {
  Product: 'Dev' | 'Beta' | 'Stable';
  Releases: {
    ReleaseId: number;
    Platform: EdgeAvailablePlatform;
    Architecture: EdgeAvailableArchitecture;
    ProductVersion: string;
  }[];
}

export type EdgeResponse = EdgeResponseItem[];

export interface VersionItem {
  version: string;
  status?: string;
}

const handler: NextApiHandler<VersionItem[]> = async (req, res) => {
  const { browser, linuxOnly } = req.query;

  if (req.method !== 'GET') {
    res.status(404).end();
    return;
  }

  if (!AVAILABLE_BROSEWRS.includes(browser as string)) {
    res.status(404).end();
    return;
  }

  const isLinuxOnly = linuxOnly === 'true';

  if (browser === 'chrome') {
    const [{ data }, { data: knownVersion }] = await Promise.all([
      axios.get<ChromeResponse>(
        'https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json',
      ),
      axios.get<ChromeChannelResponse>(
        'https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json',
      ),
    ]);

    const stableVersion = knownVersion.channels.Stable.version.split('.')[0];
    const devVersion = knownVersion.channels.Dev.version.split('.')[0];
    const canaryVersion = knownVersion.channels.Canary.version.split('.')[0];

    const linuxVersions = data.versions.filter((item) =>
      isLinuxOnly
        ? item.downloads.chromedriver?.some((item) => item.platform === 'linux64')
        : !!item.downloads.chromedriver,
    );
    const majorVersions = new Set(
      linuxVersions.map((item) => item.version.split('.')[0]).sort((a, b) => Number(b) - Number(a)),
    );
    const result: VersionItem[] = Array.from(majorVersions)
      .map((version) => {
        if (version === stableVersion) {
          return { version, status: 'latest' };
        }
        if (version === devVersion) {
          return { version, status: 'dev' };
        }
        if (version === canaryVersion) {
          return { version, status: 'canary' };
        }
        return { version };
      })
      .slice(0, 12);
    res.json(result);
    return;
  }

  if (browser === 'firefox') {
    const { data } = await axios.get<FirefoxResponse>('https://product-details.mozilla.org/1.0/firefox.json');

    const majorVersions = new Set(
      Object.values(data.releases)
        .map((item) => item.version.split('.')[0])
        .sort((a, b) => Number(b) - Number(a)),
    );

    const lastVersion = Array.from(majorVersions)[0];

    const lastVersionKeys = Object.keys(data.releases).filter((key) => key.startsWith(`firefox-${lastVersion}.`));
    const isLastVersionDev = Object.entries(data.releases)
      .filter(([key]) => lastVersionKeys.includes(key))
      .every(([, value]) => value.category === 'dev');

    const result = Array.from(majorVersions)
      .map((version, i) => {
        if (version === lastVersion) {
          return {
            version,
            status: isLastVersionDev ? 'dev' : 'latest',
          };
        }

        if (i === 1 && isLastVersionDev) {
          return {
            version,
            status: 'latest',
          };
        }

        return {
          version,
        };
      })
      .slice(0, 12);
    res.json(result);
    return;
  }

  if (browser === 'edge') {
    const { data } = await axios.get<EdgeResponse>('https://edgeupdates.microsoft.com/api/products?view=enterprise');

    const stableItem = data.find((item) => item.Product === 'Stable');

    if (stableItem === undefined) {
      res.status(404).end();
      return;
    }

    const majorVersions = new Set(
      stableItem.Releases.filter((item) =>
        isLinuxOnly ? item.Architecture === 'x64' && item.Platform === 'Linux' : true,
      )
        .map((item) => item.ProductVersion.split('.')[0])
        .sort((a, b) => Number(b) - Number(a)),
    );

    const result = Array.from(majorVersions)
      .map((version, i) => {
        if (i === 0) {
          return { version, status: 'latest' };
        }
        return { version };
      })
      .slice(0, 12);
    res.json(result);
    return;
  }
};

export default handler;
