import { 
  FaAndroid, 
  FaDownload, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaMobileAlt, 
  FaTools, 
  FaPaperPlane,
  FaInfoCircle
} from 'react-icons/fa';
import { SEOHead } from './SEOHead';
import { StructuredData } from './StructuredData';
import './ApkDownloadsPage.css';

interface AppApkInfo {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  icon: typeof FaMobileAlt;
  version: string;
  size: string;
  downloadUrl: string;
  filename: string;
  description: string;
  highlights: string[];
}

const APKS_DATA: AppApkInfo[] = [
  {
    id: 'customer',
    name: 'Assure Customer App',
    badge: 'Customer Edition',
    badgeColor: '#16a34a',
    icon: FaMobileAlt,
    version: 'v1.0.0',
    size: '24.4 MB',
    downloadUrl: '/downloads/assure-customer.apk',
    filename: 'assure-customer.apk',
    description: 'Browse smart enterprise solutions, order solar & IoT hardware, schedule certified technicians on-demand, and track service requests with real-time updates.',
    highlights: [
      'On-demand certified technician booking',
      'Solar, IoT & networking hardware catalog',
      'Real-time order tracking & push notifications'
    ]
  },
  {
    id: 'technician',
    name: 'Assure Technician App',
    badge: 'Field Operations',
    badgeColor: '#2563eb',
    icon: FaTools,
    version: 'v1.0.0',
    size: '8.3 MB',
    downloadUrl: '/downloads/assure-technician.apk',
    filename: 'assure-technician.apk',
    description: 'Designed for verified service technicians to manage daily assignments, access GPS navigation to job locations, record milestones, and submit work completion proofs.',
    highlights: [
      'Instant job notifications & schedule management',
      'Turn-by-turn navigation to customer site',
      'Digital work orders & photo verification'
    ]
  },
  {
    id: 'partner',
    name: 'Assure Partner App',
    badge: 'AgriTech & Fleet',
    badgeColor: '#0d9488',
    icon: FaPaperPlane,
    version: 'v1.0.0',
    size: '8.4 MB',
    downloadUrl: '/downloads/assure-partner.apk',
    filename: 'assure-partner.apk',
    description: 'Purpose-built for AgriTech drone pilots and fleet franchise partners to accept spraying requests, manage drone assets, monitor acreage coverage, and track earnings.',
    highlights: [
      'Agricultural drone spraying mission dispatch',
      'Acreage mapping & flight performance analytics',
      'Transparent partner payout ledger & reports'
    ]
  }
];

export function ApkDownloadsPage() {
  return (
    <div className="apk-page-container">
      <SEOHead 
        title="Download Android APKs | Assure Technologies"
        description="Download official Android APKs for Assure Technologies: Customer App, Technician Companion App, and AgriTech Drone Partner App."
        canonicalUrl="https://assuretechnologies.com/apks"
      />
      <StructuredData type="organization" />

      {/* Hero Header */}
      <header className="apk-header">
        <div className="apk-badge-pill">
          <FaAndroid className="apk-android-icon" />
          <span>Official Android Applications</span>
        </div>
        <h1 className="apk-title">Download Assure Mobile Apps</h1>
        <p className="apk-subtitle">
          Direct, secure Android APK downloads for our customers, field service technicians, and drone partners.
        </p>

        <div className="apk-trust-row">
          <div className="apk-trust-item">
            <FaShieldAlt className="apk-trust-icon" />
            <span>Malware & Virus Checked</span>
          </div>
          <div className="apk-trust-item">
            <FaAndroid className="apk-trust-icon" />
            <span>Android 8.0 & Above</span>
          </div>
          <div className="apk-trust-item">
            <FaCheckCircle className="apk-trust-icon" />
            <span>Direct High-Speed Download</span>
          </div>
        </div>
      </header>

      {/* APK Cards Grid */}
      <section className="apk-grid" aria-label="Available APK downloads">
        {APKS_DATA.map((app) => {
          const IconComponent = app.icon;
          return (
            <div key={app.id} className="apk-card">
              <div className="apk-card-top">
                <div 
                  className="apk-icon-box"
                  style={{ backgroundColor: `${app.badgeColor}15`, color: app.badgeColor }}
                >
                  <IconComponent />
                </div>
                <div className="apk-badge-meta">
                  <span 
                    className="apk-category-tag"
                    style={{ color: app.badgeColor, backgroundColor: `${app.badgeColor}15` }}
                  >
                    {app.badge}
                  </span>
                  <span className="apk-version-tag">{app.version} • {app.size}</span>
                </div>
              </div>

              <h2 className="apk-card-title">{app.name}</h2>
              <p className="apk-card-desc">{app.description}</p>

              <div className="apk-features-box">
                <h3 className="apk-features-heading">Key Capabilities</h3>
                <ul className="apk-features-list">
                  {app.highlights.map((item, idx) => (
                    <li key={idx}>
                      <FaCheckCircle className="apk-check-icon" style={{ color: app.badgeColor }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="apk-card-actions">
                <a 
                  href={app.downloadUrl}
                  download={app.filename}
                  className="apk-download-btn"
                  style={{ backgroundColor: app.badgeColor }}
                >
                  <FaDownload />
                  <span>Download APK ({app.size})</span>
                </a>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick Installation Instructions */}
      <section className="apk-install-banner">
        <div className="apk-install-header">
          <FaInfoCircle className="apk-info-icon" />
          <h2 className="apk-install-title">How to Install on Android</h2>
        </div>
        <div className="apk-steps-grid">
          <div className="apk-step-card">
            <span className="apk-step-num">1</span>
            <div className="apk-step-text">
              <strong>Download File</strong>
              <p>Click "Download APK" above directly on your Android phone or tablet.</p>
            </div>
          </div>
          <div className="apk-step-card">
            <span className="apk-step-num">2</span>
            <div className="apk-step-text">
              <strong>Allow Installation</strong>
              <p>If prompted by Chrome or your browser, tap Settings and enable "Allow from this source".</p>
            </div>
          </div>
          <div className="apk-step-card">
            <span className="apk-step-num">3</span>
            <div className="apk-step-text">
              <strong>Google Play Protect</strong>
              <p>If blocked, tap "More details" → "Install anyway", or temporarily turn off Play Protect in Play Store settings.</p>
            </div>
          </div>
          <div className="apk-step-card">
            <span className="apk-step-num">4</span>
            <div className="apk-step-text">
              <strong>Open & Sign In</strong>
              <p>Tap "Install", open the app, and log in with your registered credentials.</p>
            </div>
          </div>
        </div>

        <div className="apk-play-protect-box">
          <FaShieldAlt className="apk-play-protect-icon" />
          <div className="apk-play-protect-content">
            <strong>Google Play Protect Warning?</strong>
            <p>
              Since these are direct APK downloads outside the Google Play Store, Play Protect may flag them as unrecognized. 
              To proceed: tap <b>"More details"</b> then <b>"Install anyway"</b>. If installation remains blocked, open <b>Google Play Store → Profile Icon → Play Protect → Settings (Gear Icon)</b> and temporarily toggle off <b>"Scan apps with Play Protect"</b>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
