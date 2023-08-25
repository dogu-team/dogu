// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
require('dotenv').config();
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Dogu Documentation',
  tagline: 'Automate your game QA',
  url: 'https://docs.dogutech.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'dogu-team', // Usually your GitHub org/user name.
  projectName: 'dogu', // Usually your repo name.
  scripts: [
    {
      src: '//fw-cdn.com/10683920/3497107.js',
      async: false,
    },
  ],

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/dogu-team/dogu/tree/main/docs',
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
        gtag: {
          trackingID: process.env.GOOGLE_ANALYTICS_ID,
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Dogu Docs',
        logo: {
          alt: 'Dogu Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            href: 'https://github.com/dogu-team/dogu',
            label: 'GitHub',
            position: 'right',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'getStarted',
                to: '/get-started',
              },
              {
                label: 'tutorial',
                to: '/get-started/tutorials',
              },
            ],
          },
          {
            title: 'Services',
            items: [
              {
                label: 'Dogu Cloud',
                href: 'https://dogutech.io',
              },
              {
                label: 'Download Dogu Agent',
                href: 'https://dogutech.io/downloads/dogu-agent',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/dogu-team/dogu',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Dogu Technologies, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['csharp'],
      },
      algolia: {
        appId: 'DFGNWXJ2OY',
        apiKey: '5829238fbef1aecbac6290f565d7f8c2',
        indexName: 'dogutech',
      },
    }),
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
};

module.exports = config;
