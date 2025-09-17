import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'My Engines Documentation',
  tagline: 'Product Information Management System',
  favicon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>',

  // Set the production url of your site here
  url: 'https://your-pim-docs.com',
  baseUrl: '/',

  // GitHub pages deployment config (optional)
  organizationName: 'your-org',
  projectName: 'pim-docs',

  onBrokenLinks: 'warn', // Changed from 'throw' to 'warn'
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/your-org/pim/tree/main/documentation/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/pim-social-card.jpg',
    navbar: {
      title: 'My Engines',
      logo: {
        alt: 'My Engines',
        src: 'img/rocket-heroicon.svg', // Use the Heroicons rocket
        width: 32,
        height: 32,
      },
      hideOnScroll: false,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/api/overview',
          label: 'API',
          position: 'left',
        },
        {
          href: 'http://localhost:3010/api/docs',
          label: 'Swagger',
          position: 'right',
        },
        {
          href: 'https://github.com/your-org/pim',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Quick Start',
              to: '/docs/quick-start',
            },
            {
              label: 'API Reference',
              to: '/docs/api/overview',
            },
          ],
        },
        {
          title: 'Features',
          items: [
            {
              label: 'Products',
              to: '/docs/features/products',
            },
            {
              label: 'Media Library',
              to: '/docs/features/media-library',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Swagger API',
              href: 'http://localhost:3010/api/docs',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/your-org/pim',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Engines. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'sql'],
    },
    algolia: {
      // Optional: Add Algolia search later
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'pim_docs',
      contextualSearch: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;