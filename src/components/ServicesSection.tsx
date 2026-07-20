import {
  FaNetworkWired, FaRobot, FaLeaf, FaVideo, FaPhone,
  FaHeadset, FaFingerprint, FaSatelliteDish, FaServer,
  FaLaptop, FaSun, FaIndustry, FaShieldAlt, FaMicrochip,
  FaSeedling, FaBolt
} from 'react-icons/fa';
import './ServicesSection.css';

const services = [
  { id: 1, label: 'Networking', title: 'Industrial Internet and Local Area Networking Solutions', icon: <FaNetworkWired /> },
  { id: 2, label: 'Automation', title: 'Home, Gate, Boom Barrier Automation and Solutions', icon: <FaRobot /> },
  { id: 3, label: 'AgriTech', title: 'Agriculture and Aquaculture IoT Tools and Automation', icon: <FaLeaf /> },
  { id: 4, label: 'Surveillance', title: 'CCTV Networking and AMC Contract', icon: <FaVideo /> },
  { id: 5, label: 'Telephony', title: 'EPABX System', icon: <FaPhone /> },
  { id: 6, label: 'Intercom', title: 'Intercom System', icon: <FaHeadset /> },
  { id: 7, label: 'Biometrics', title: 'Biometric & Attendance System', icon: <FaFingerprint /> },
  { id: 8, label: 'Communication', title: 'Walkie Talkies, Signal Booster, Signal Jammer, Satellite Phone Solutions', icon: <FaSatelliteDish /> },
  { id: 9, label: 'Infrastructure', title: 'Server Racks and Cable Structuring', icon: <FaServer /> },
  { id: 10, label: 'IT Support', title: 'Computer, Laptop, Printer Sales, Service & AMC Contract', icon: <FaLaptop /> },
  { id: 11, label: 'Solar', title: 'Solar Power Solutions', icon: <FaSun /> },
  { id: 12, label: 'IIoT', title: 'Industrial IoT Solutions', icon: <FaIndustry /> },
  { id: 13, label: 'Security', title: 'Fire and Security Alarm System', icon: <FaShieldAlt /> },
  { id: 14, label: 'Sensors', title: 'IoT Sensor Systems and Services', icon: <FaMicrochip /> },
  { id: 15, label: 'Agriculture', title: 'Agriculture Natural Farming Contracts', icon: <FaSeedling /> },
  { id: 16, label: 'Fiber Optics', title: 'OFC Networking', icon: <FaBolt /> },
];

export function ServicesSection() {
  return (
    <section className="services-section">
      <div className="services-header">
        <h2>Services We Offer</h2>
        <div className="services-divider"></div>
        <p>Comprehensive technology and infrastructure solutions for your business</p>
      </div>

      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-icon">
              {service.icon}
            </div>
            <h5 className="service-label">{service.label}</h5>
            <p className="service-title">{service.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
