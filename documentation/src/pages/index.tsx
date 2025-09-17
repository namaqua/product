import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';
// Use outline icons to match the admin app exactly
import { 
  RocketLaunchIcon, 
  CubeIcon,
  PhotoIcon,
  CodeBracketIcon,
  ClockIcon,
  DocumentTextIcon,
  ServerStackIcon,
  FolderIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
  UsersIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ChartPieIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  CommandLineIcon,
  PuzzlePieceIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.iconContainer}>
          <RocketLaunchIcon className={styles.rocketIcon} />
        </div>
        <Heading as="h1" className="hero__title">
          My Engines API Server
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            <ClockIcon className={styles.buttonIcon} />
            Get Started - 5min
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="http://localhost:3010/api/docs"
            target="_blank">
            <DocumentTextIcon className={styles.buttonIcon} />
            API Documentation
          </Link>
        </div>
      </div>
    </header>
  );
}

function Feature({Icon, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Icon className={styles.featureIcon} />
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function EngineSection({Icon, title, description, features}) {
  return (
    <div className={styles.engineSection}>
      <div className={styles.engineHeader}>
        <Icon className={styles.engineIcon} />
        <div>
          <h3 className={styles.engineTitle}>{title}</h3>
          <p className={styles.engineDescription}>{description}</p>
        </div>
      </div>
      <div className={styles.engineFeatures}>
        {features.map((feature, idx) => (
          <div key={idx} className={styles.engineFeature}>
            <feature.icon className={styles.engineFeatureIcon} />
            <span>{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <Layout
      title={`Welcome to My Engines`}
      description="Modern Product Information Management System">
      <HomepageHeader />
      
      <main>
        {/* Main Features Section */}
        <section className={styles.features}>
          <div className="container">
            <div className="text--center margin-bottom--xl">
              <h2>Core Capabilities</h2>
              <p className="text--lg">Everything you need to manage your products at scale</p>
            </div>
            <div className="row">
              <Feature
                Icon={ServerStackIcon}
                title="Modern Stack"
                description="Built with NestJS, React, TypeScript, and PostgreSQL for reliability and performance"
              />
              <Feature
                Icon={PhotoIcon}
                title="Media Library"
                description="Powerful digital asset management with automatic optimization and CDN support"
              />
              <Feature
                Icon={CodeBracketIcon}
                title="API First"
                description="RESTful API with Swagger documentation and SDK generation"
              />
            </div>
            <div className="row margin-top--lg">
              <Feature
                Icon={CubeIcon}
                title="Product Management"
                description="Complete product lifecycle management with variants and attributes"
              />
              <Feature
                Icon={BoltIcon}
                title="Fast & Scalable"
                description="Optimized for performance with Redis caching and efficient queries"
              />
              <Feature
                Icon={ShieldCheckIcon}
                title="Enterprise Security"
                description="Role-based access control, JWT authentication, and audit logging"
              />
            </div>
          </div>
        </section>

        {/* Engines Overview Section */}
        <section className={styles.enginesSection}>
          <div className="container">
            <div className="text--center margin-bottom--xl">
              <h2>Modular Engine Architecture</h2>
              <p className="text--lg">Flexible, extensible modules that work together seamlessly</p>
            </div>
            
            <div className={styles.enginesGrid}>
              <EngineSection
                Icon={CubeIcon}
                title="Product Engine"
                description="Comprehensive product information management"
                features={[
                  { icon: TagIcon, text: 'Flexible Attributes' },
                  { icon: FolderIcon, text: 'Category Trees' },
                  { icon: ClipboardDocumentListIcon, text: 'Workflows' },
                  { icon: ArrowPathIcon, text: 'Import/Export' }
                ]}
              />
              
              <EngineSection
                Icon={CreditCardIcon}
                title="Subscription Engine"
                description="Manage recurring billing and subscriptions"
                features={[
                  { icon: UsersIcon, text: 'Subscriber Management' },
                  { icon: ChartPieIcon, text: 'Analytics' },
                  { icon: SparklesIcon, text: 'Automated Billing' },
                  { icon: ShieldCheckIcon, text: 'Payment Security' }
                ]}
              />
              
              <EngineSection
                Icon={ShoppingCartIcon}
                title="Marketplace Engine"
                description="Multi-vendor marketplace capabilities"
                features={[
                  { icon: UsersIcon, text: 'Vendor Portal' },
                  { icon: GlobeAltIcon, text: 'Multi-channel' },
                  { icon: ArrowTrendingUpIcon, text: 'Commission System' },
                  { icon: Cog6ToothIcon, text: 'Order Management' }
                ]}
              />
            </div>
          </div>
        </section>

        {/* Developer Tools Section */}
        <section className={styles.developerSection}>
          <div className="container">
            <div className="text--center margin-bottom--xl">
              <h2>Built for Developers</h2>
              <p className="text--lg">Powerful tools and documentation to accelerate development</p>
            </div>
            <div className="row">
              <Feature
                Icon={CommandLineIcon}
                title="CLI Tools"
                description="Command-line tools for scaffolding, migrations, and deployment"
              />
              <Feature
                Icon={PuzzlePieceIcon}
                title="Plugin System"
                description="Extend functionality with custom modules and integrations"
              />
              <Feature
                Icon={BeakerIcon}
                title="Testing Suite"
                description="Comprehensive testing tools and CI/CD integration"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className="container text--center">
            <h2>Ready to Get Started?</h2>
            <p className="text--lg margin-bottom--lg">
              Set up your development environment in minutes
            </p>
            <div className={styles.ctaButtons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/quick-start">
                <RocketLaunchIcon className={styles.buttonIcon} />
                Quick Start Guide
              </Link>
              <Link
                className="button button--outline button--primary button--lg"
                to="/docs/intro">
                <BookOpenIcon className={styles.buttonIcon} />
                Read Documentation
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}