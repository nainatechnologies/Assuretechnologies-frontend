import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MdSearch, 
  MdHome, 
  MdBuild, 
  MdShoppingBag, 
  MdPerson, 
  MdWork, 
  MdGavel, 
  MdChevronRight, 
  MdCode, 
  MdOpenInNew,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdDescription,
  MdHub,
  MdClear,
  MdAutoAwesome,
  MdLayers
} from 'react-icons/md';
import { SEOHead } from './SEOHead';
import { StructuredData } from './StructuredData';
import './SitemapPage.css';

interface SitemapLink {
  title: string;
  path: string;
  description: string;
  isExternal?: boolean;
  badge?: string;
}

interface SitemapCategory {
  id: string;
  title: string;
  shortTitle: string;
  icon: any;
  accentGradient: string;
  colorClass: string;
  links: SitemapLink[];
}

export function SitemapPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const sitemapData: SitemapCategory[] = useMemo(() => [
    {
      id: 'main',
      title: 'Main Navigation & Core Pages',
      shortTitle: 'Main Pages',
      icon: MdHome,
      accentGradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
      colorClass: 'cat-blue',
      links: [
        { title: 'Home Page', path: '/', description: 'Assure Technologies flagship landing page & technology showcase' },
        { title: 'Book a Service', path: '/book-service', description: 'On-demand certified technician and drone spraying booking platform' },
        { title: 'Order Products', path: '/order-products', description: 'Enterprise hardware, IoT, solar & networking equipment store' },
        { title: 'Shopping Cart', path: '/cart', description: 'Review selected items, compute delivery & proceed to secure checkout' },
        { title: 'Customer Login', path: '/login', description: 'Sign in to access personal service bookings, addresses & orders' },
        { title: 'Create Account', path: '/register', description: 'Register a new personal or corporate customer account' },
        { title: 'Forgot Password', path: '/forgot-password', description: 'Password reset and customer account recovery assistance' }
      ]
    },
    {
      id: 'services',
      title: 'Professional Services Catalog (All 16 Domains)',
      shortTitle: 'Services (16)',
      icon: MdBuild,
      accentGradient: 'linear-gradient(135deg, #4f46e5, #6366f1)',
      colorClass: 'cat-indigo',
      links: [
        { title: '1. Networking & Infrastructure', path: '/book-service?category=Networking', description: 'Structured cabling, gigabit switch setup, router config & enterprise Wi-Fi' },
        { title: '2. Smart Office & Home Automation', path: '/book-service?category=Automation', description: 'IoT controllers, automated relays, voice ecosystems & smart switches' },
        { title: '3. AgriTech & Drone Spraying', path: '/book-service?category=AgriTech', description: 'Agricultural drone spraying, crop health inspection & precision farming' },
        { title: '4. CCTV Surveillance & Monitoring', path: '/book-service?category=Surveillance', description: 'High-definition IP camera installation, NVR/DVR setup & maintenance' },
        { title: '5. Telephony & EPABX Systems', path: '/book-service?category=Telephony', description: 'Digital EPABX, IP-PBX, PRI lines & corporate VoIP phone routing' },
        { title: '6. Intercom & Door Entry Systems', path: '/book-service?category=Intercom', description: 'Multi-apartment video door phones, audio intercoms & access handsets' },
        { title: '7. Biometrics & Access Control', path: '/book-service?category=Biometrics', description: 'Fingerprint, facial recognition, RFID turnstiles & attendance systems' },
        { title: '8. Wireless & Satellite Communication', path: '/book-service?category=Communication', description: 'Point-to-point wireless bridges, RF telemetry & long-range transceivers' },
        { title: '9. IT Infrastructure & Server Setup', path: '/book-service?category=Infrastructure', description: 'Server rack deployment, cooling management & power distribution' },
        { title: '10. Enterprise IT Support & Repair', path: '/book-service?category=IT%20Support', description: 'Hardware diagnostics, OS troubleshooting & on-site technical support' },
        { title: '11. Solar Power & Green Energy', path: '/book-service?category=Solar', description: 'Rooftop solar installations, grid synchronization & clean energy maintenance' },
        { title: '12. Industrial IoT (IIoT) Integration', path: '/book-service?category=IIoT', description: 'Factory automation, PLC data logging, RTU integration & SCADA sensors' },
        { title: '13. Security Systems & Alarms', path: '/book-service?category=Security', description: 'Intrusion alarm panels, perimeter vibration sensors & siren systems' },
        { title: '14. Sensors & Environmental Telemetry', path: '/book-service?category=Sensors', description: 'Soil moisture probes, ambient temperature, gas & motion sensors' },
        { title: '15. Agriculture & Precision Irrigation', path: '/book-service?category=Agriculture', description: 'Automated solenoid drip valves, pump controllers & soil telemetry' },
        { title: '16. Fiber Optics Cabling & Splicing', path: '/book-service?category=Fiber%20Optics', description: 'Optical time-domain reflectometer (OTDR) testing & fusion splicing' }
      ]
    },
    {
      id: 'products',
      title: 'Hardware & Product Store (All 16 Domains)',
      shortTitle: 'Products (16)',
      icon: MdShoppingBag,
      accentGradient: 'linear-gradient(135deg, #059669, #10b981)',
      colorClass: 'cat-emerald',
      links: [
        { title: 'All Products Store', path: '/order-products', description: 'Browse all certified equipment, components, spare parts & modules' },
        { title: '1. Networking Gear & Routers', path: '/order-products?category=Networking', description: 'Managed gigabit switches, enterprise Wi-Fi 6 routers & Cat6 patch panels' },
        { title: '2. Smart Automation Hubs & Relays', path: '/order-products?category=Automation', description: 'Zigbee/Wi-Fi gateways, dimmer modules, smart plugs & touch panels' },
        { title: '3. AgriTech Drones & Flight Spares', path: '/order-products?category=AgriTech', description: 'Sprayer nozzles, high-discharge LiPo batteries, props & flight tanks' },
        { title: '4. Security Cameras & NVR Storage', path: '/order-products?category=Surveillance', description: '4K Night-vision dome/bullet cameras, POE switches & surveillance HDDs' },
        { title: '5. EPABX Exchanges & IP Phones', path: '/order-products?category=Telephony', description: 'Digital hybrid EPABX boards, HD voice IP handsets & conference phones' },
        { title: '6. Video Door Phones & Intercoms', path: '/order-products?category=Intercom', description: 'Color LCD indoor monitors, multi-tenant outdoor call panels & power units' },
        { title: '7. Biometric Terminals & Scanners', path: '/order-products?category=Biometrics', description: 'Optical fingerprint scanners, AI facial terminals & RFID smart cards' },
        { title: '8. Wireless Antennas & Transceivers', path: '/order-products?category=Communication', description: '5GHz directional antennas, RF transceivers & signal booster kits' },
        { title: '9. Server Racks & Infrastructure', path: '/order-products?category=Infrastructure', description: '42U server enclosures, rackmount PDUs, cable managers & patch cords' },
        { title: '10. IT Hardware Spares & Adapters', path: '/order-products?category=IT%20Support', description: 'Power adapters, SSDs, RAM modules, USB docks & technician toolkits' },
        { title: '11. Solar Panels & MPPT Inverters', path: '/order-products?category=Solar', description: 'Tier-1 monocrystalline panels, hybrid solar inverters & solar batteries' },
        { title: '12. IIoT Gateways & Modbus RTUs', path: '/order-products?category=IIoT', description: 'Industrial cellular 4G/5G gateways, RS485 converter units & DIN rail power' },
        { title: '13. Intrusion Detectors & Sirens', path: '/order-products?category=Security', description: 'PIR motion sensors, glass-break detectors, magnetic door contacts & sirens' },
        { title: '14. Multi-Parametric Smart Sensors', path: '/order-products?category=Sensors', description: 'Temperature, humidity, smoke, CO2 & 4-20mA industrial sensor transducers' },
        { title: '15. Smart Irrigation Controllers', path: '/order-products?category=Agriculture', description: 'Weather-responsive timer valves, soil moisture probes & pump controllers' },
        { title: '16. Fiber Optic Patch Cords & SFPs', path: '/order-products?category=Fiber%20Optics', description: 'Single-mode LC/SC patch cords, optical transceivers & splice trays' }
      ]
    },
    {
      id: 'account',
      title: 'Customer Account & Tracking',
      shortTitle: 'Account',
      icon: MdPerson,
      accentGradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      colorClass: 'cat-purple',
      links: [
        { title: 'User Profile', path: '/profile', description: 'View personal details, contact info & verification status' },
        { title: 'Edit Profile & Addresses', path: '/profile/edit', description: 'Update profile information and manage saved delivery addresses' },
        { title: 'Order History', path: '/orders', description: 'Track order statuses, live dispatch updates & view receipts' },
        { title: 'WhatsApp Live Support', path: 'https://wa.me/919505261283', description: 'Connect directly with technical support specialists on WhatsApp', isExternal: true }
      ]
    },
    {
      id: 'careers',
      title: 'Careers & Employment Portal',
      shortTitle: 'Careers',
      icon: MdWork,
      accentGradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
      colorClass: 'cat-amber',
      links: [
        { title: 'Careers Overview', path: '/career', description: 'Explore career paths, engineering culture & open openings at Assure' },
        { title: 'Field Technician Roles', path: '/career', description: 'On-site installation and hardware maintenance openings' },
        { title: 'Solar Energy Engineers', path: '/career', description: 'Clean energy projects, rooftop assessment & installation jobs' },
        { title: 'Certified Drone Operators', path: '/career', description: 'Precision agricultural drone pilots and mission controllers' }
      ]
    },
    {
      id: 'legal',
      title: 'Legal, Compliance & Support',
      shortTitle: 'Legal & Info',
      icon: MdGavel,
      accentGradient: 'linear-gradient(135deg, #475569, #64748b)',
      colorClass: 'cat-slate',
      links: [
        { title: 'Privacy Policy', path: '/#privacy', description: 'Data protection standards, cookie policy & user privacy guarantees' },
        { title: 'Terms & Conditions', path: '/#terms', description: 'Platform usage agreement, service warranties & terms of sale' },
        { title: 'Cancellation & Refund Policy', path: '/#refund', description: 'Guidelines for service cancellations, hardware returns & refunds' },
        { title: 'Contact & Support Desk', path: '/#contact', description: 'Corporate offices, phone directory, and 24/7 email assistance' }
      ]
    }
  ], []);

  // Filter categories and links based on search and active category tab
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    return sitemapData
      .filter(category => {
        if (activeFilter !== 'all' && category.id !== activeFilter) {
          return false;
        }
        return true;
      })
      .map(category => {
        if (!query) return category;

        const matchedLinks = category.links.filter(link => 
          link.title.toLowerCase().includes(query) ||
          link.description.toLowerCase().includes(query) ||
          link.path.toLowerCase().includes(query)
        );

        return {
          ...category,
          links: matchedLinks
        };
      })
      .filter(category => category.links.length > 0);
  }, [sitemapData, searchQuery, activeFilter]);

  const totalLinksCount = useMemo(() => {
    return sitemapData.reduce((sum, cat) => sum + cat.links.length, 0);
  }, [sitemapData]);

  return (
    <>
      <SEOHead 
        title="HTML Sitemap & Complete Directory"
        description="Explore all 16 technology domains, on-demand certified services, enterprise hardware store, and account resources for Assure Technologies."
        canonicalUrl="https://assuretechnologies.com/sitemap"
      />
      <StructuredData 
        type="breadcrumb"
        data={{
          items: [
            { name: 'Home', url: 'https://assuretechnologies.com/' },
            { name: 'HTML Sitemap & Directory', url: 'https://assuretechnologies.com/sitemap' }
          ]
        }}
      />
      <StructuredData 
        type="sitemap"
        data={{ categories: sitemapData }}
      />

      <main className="stm-container">
        <div className="stm-wrapper">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="stm-breadcrumb">
            <Link to="/">Home</Link>
            <span className="stm-breadcrumb-sep">/</span>
            <span className="stm-breadcrumb-current">Sitemap Directory</span>
          </nav>

          {/* Premium Hero Section */}
          <header className="stm-hero">
            <div className="stm-hero-glow stm-glow-1" />
            <div className="stm-hero-glow stm-glow-2" />
            
            <div className="stm-hero-content">
              <div className="stm-eyebrow">
                <span className="stm-pulse-dot" />
                <MdAutoAwesome size={14} />
                <span>All 16 Technology Domains &amp; Service Index</span>
              </div>

              <h1 className="stm-title">
                Sitemap &amp; <span className="stm-title-gradient">Site Architecture</span>
              </h1>

              <p className="stm-subtitle">
                Comprehensive directory indexing all 16 domains across on-demand services, enterprise hardware inventory, customer portals, and legal compliance.
              </p>

              {/* Sleek Floating Search & Action Bar */}
              <div className="stm-search-bar-wrapper">
                <div className="stm-search-input-group">
                  <MdSearch className="stm-search-icon" size={22} />
                  <input
                    type="text"
                    className="stm-search-input"
                    placeholder="Search across all 16 categories, services, or products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search Sitemap Directory"
                  />
                  {searchQuery && (
                    <button 
                      className="stm-search-clear" 
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <MdClear size={18} />
                    </button>
                  )}
                </div>

                <a 
                  href="/sitemap.xml" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="stm-xml-pill-btn"
                  title="View Raw XML Sitemap Feed for Crawlers"
                >
                  <MdCode size={18} />
                  <span>XML Sitemap ({totalLinksCount} URLs)</span>
                  <MdOpenInNew size={14} className="stm-btn-arrow" />
                </a>
              </div>
            </div>
          </header>

          {/* Filter Tabs Bar */}
          <div className="stm-tabs-bar" role="tablist">
            <button
              className={`stm-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              <MdLayers size={16} />
              <span>All Links</span>
              <span className="stm-tab-count">{totalLinksCount}</span>
            </button>
            {sitemapData.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  className={`stm-tab-btn ${activeFilter === category.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(category.id)}
                >
                  <Icon size={16} />
                  <span>{category.shortTitle}</span>
                  <span className="stm-tab-count">{category.links.length}</span>
                </button>
              );
            })}
          </div>

          {/* Directory Cards Grid */}
          {filteredCategories.length === 0 ? (
            <div className="stm-empty-card">
              <div className="stm-empty-icon">
                <MdSearch size={36} />
              </div>
              <h3>No matching pages found</h3>
              <p>We couldn't find any sitemap links matching <strong>"{searchQuery}"</strong></p>
              <button 
                className="stm-reset-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear Search Query
              </button>
            </div>
          ) : (
            <section className="stm-cards-grid" aria-label="Sitemap Categories">
              {filteredCategories.map(category => {
                const Icon = category.icon;
                const isCollapsed = Boolean(collapsedCategories[category.id]);

                return (
                  <article key={category.id} className={`stm-card ${category.colorClass}`}>
                    <div className="stm-card-accent-bar" style={{ background: category.accentGradient }} />
                    
                    <div 
                      className="stm-card-header" 
                      onClick={() => toggleCategory(category.id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={!isCollapsed}
                    >
                      <div className="stm-icon-wrapper" style={{ background: category.accentGradient }}>
                        <Icon size={20} color="#ffffff" />
                      </div>
                      
                      <div className="stm-card-title-group">
                        <h2 className="stm-card-title">{category.title}</h2>
                        <span className="stm-card-badge">{category.links.length} links</span>
                      </div>

                      <div className="stm-collapse-indicator">
                        {isCollapsed ? <MdKeyboardArrowDown size={22} /> : <MdKeyboardArrowUp size={22} />}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <ul className="stm-links-list">
                        {category.links.map((link, idx) => (
                          <li key={idx}>
                            {link.isExternal ? (
                              <a 
                                href={link.path} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="stm-link-row"
                              >
                                <div className="stm-link-body">
                                  <div className="stm-link-heading">
                                    <span className="stm-link-title">{link.title}</span>
                                    <MdOpenInNew size={14} className="stm-ext-icon" />
                                  </div>
                                  <p className="stm-link-desc">{link.description}</p>
                                </div>
                                <div className="stm-arrow-circle">
                                  <MdChevronRight size={18} />
                                </div>
                              </a>
                            ) : (
                              <Link to={link.path} className="stm-link-row">
                                <div className="stm-link-body">
                                  <div className="stm-link-heading">
                                    <span className="stm-link-title">{link.title}</span>
                                  </div>
                                  <p className="stm-link-desc">{link.description}</p>
                                </div>
                                <div className="stm-arrow-circle">
                                  <MdChevronRight size={18} />
                                </div>
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </section>
          )}

          {/* Machine-Readable XML Sitemaps Explorer Section */}
          <section className="stm-xml-section">
            <div className="stm-xml-header">
              <div className="stm-xml-icon-chip">
                <MdHub size={24} />
              </div>
              <div>
                <h3 className="stm-xml-title">Crawler &amp; Indexing Feeds</h3>
                <p className="stm-xml-subtitle">
                  Machine-readable endpoints indexing all 16 domains for Googlebot, Bingbot, and search discovery protocols.
                </p>
              </div>
            </div>

            <div className="stm-xml-grid">
              <a 
                href="/sitemap.xml" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="stm-xml-card"
              >
                <div className="stm-xml-card-content">
                  <div className="stm-xml-file-icon blue">
                    <MdDescription size={26} />
                  </div>
                  <div>
                    <h4 className="stm-xml-card-title">Master XML Sitemap</h4>
                    <span className="stm-xml-card-path">/sitemap.xml</span>
                    <p className="stm-xml-card-text">Canonical feed of all 16 service &amp; hardware domains with crawl frequencies.</p>
                  </div>
                </div>
                <div className="stm-xml-action-btn">
                  <span>View XML</span>
                  <MdOpenInNew size={16} />
                </div>
              </a>

              <a 
                href="/robots.txt" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="stm-xml-card"
              >
                <div className="stm-xml-card-content">
                  <div className="stm-xml-file-icon slate">
                    <MdCode size={26} />
                  </div>
                  <div>
                    <h4 className="stm-xml-card-title">Robots Policy File</h4>
                    <span className="stm-xml-card-path">/robots.txt</span>
                    <p className="stm-xml-card-text">Automated crawler access rules, directory whitelists &amp; protections.</p>
                  </div>
                </div>
                <div className="stm-xml-action-btn">
                  <span>View Rules</span>
                  <MdOpenInNew size={16} />
                </div>
              </a>
            </div>
          </section>

          {/* Site Architecture Meta Specs Strip */}
          <section className="stm-specs-strip">
            <div className="stm-spec-item">
              <span className="stm-spec-label">Indexed Routes</span>
              <strong className="stm-spec-val">{totalLinksCount} Unique URLs</strong>
            </div>
            <div className="stm-spec-divider" />
            <div className="stm-spec-item">
              <span className="stm-spec-label">Domain Coverage</span>
              <strong className="stm-spec-val">All 16 Categories</strong>
            </div>
            <div className="stm-spec-divider" />
            <div className="stm-spec-item">
              <span className="stm-spec-label">Protocol</span>
              <strong className="stm-spec-val">HTTPS / UTF-8</strong>
            </div>
            <div className="stm-spec-divider" />
            <div className="stm-spec-item">
              <span className="stm-spec-label">Crawl Frequency</span>
              <strong className="stm-spec-val">Daily / Real-Time</strong>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
