import nextTranslate from 'next-translate-plugin';
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, child_process: false };
    config.experiments = { ...config.experiments, topLevelAwait: true };

    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'));

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  images: {
    domains: ['s3.ap-northeast-2.amazonaws.com', 'localhost', '127.0.0.1', `${process.env.NEXT_PUBLIC_FILE_SERVER_HOST}`],
    minimumCacheTTL: 20,
  },
  experimental: {
    scrollRestoration: true,
  },
  i18n: {
    locales: ['en', 'ko'],
    defaultLocale: 'en',
  },
  swcMinify: true,
  headers: async () => {
    return process.env.NEXT_PUBLIC_ENV === 'production' || process.env.NEXT_PUBLIC_ENV === 'development'
      ? [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
              },
            ],
          },
        ]
      : [];
  },
  compiler: {
    styledComponents: true,
  },
  sentry: {
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
  },
};

const sentryWebpackPluginOptions = {
  org: 'dogu-technologies',
  project: 'console-web-front',
  silent: true, // Suppresses all logs
};

export default withSentryConfig(nextTranslate(nextConfig), sentryWebpackPluginOptions);
