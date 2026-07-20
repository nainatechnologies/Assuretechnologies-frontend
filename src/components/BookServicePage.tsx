import {
  FaSatelliteDish, FaServer, FaLaptop, FaIndustry,
  FaShieldAlt, FaMicrochip, FaSeedling, FaBolt
} from 'react-icons/fa';
import svcNetworking   from '../assets/svc_networking.png';
import svcAutomation   from '../assets/svc_automation.png';
import svcAgritech     from '../assets/svc_agritech.png';
import svcSurveillance from '../assets/svc_surveillance.png';
import svcTelephony    from '../assets/svc_telephony.png';
import svcIntercom     from '../assets/svc_intercom.png';
import svcBiometrics   from '../assets/svc_biometrics.png';
import './BookServicePage.css';

type Service = {
  id: number;
  label: string;
  title: string;
  img?: string;
  icon?: React.ReactNode;
};

const services: Service[] = [
  { id: 1,  label: 'Networking',    title: 'Industrial Internet and Local Area Networking Solutions',              img: svcNetworking   },
  { id: 2,  label: 'Automation',    title: 'Home, Gate, Boom Barrier Automation and Solutions',                   img: svcAutomation   },
  { id: 3,  label: 'AgriTech',      title: 'Agriculture and Aquaculture IoT Tools and Automation',                img: svcAgritech     },
  { id: 4,  label: 'Surveillance',  title: 'CCTV Networking and AMC Contract',                                    img: svcSurveillance },
  { id: 5,  label: 'Telephony',     title: 'EPABX System',                                                        img: svcTelephony    },
  { id: 6,  label: 'Intercom',      title: 'Intercom System',                                                     img: svcIntercom     },
  { id: 7,  label: 'Biometrics',    title: 'Biometric & Attendance System',                                       img: svcBiometrics   },
  { id: 8,  label: 'Communication', title: 'Walkie Talkies, Signal Booster, Signal Jammer, Satellite Phone Solutions', icon: <FaSatelliteDish /> },
  { id: 9,  label: 'Infrastructure',title: 'Server Racks and Cable Structuring',                                  icon: <FaServer />        },
  { id: 10, label: 'IT Support',    title: 'Computer, Laptop, Printer Sales, Service & AMC Contract',             icon: <FaLaptop />        },
  { id: 11, label: 'Solar',         title: 'Solar Power Solutions',                                               icon: <span style={{fontSize:'3.5rem'}}>☀️</span> },
  { id: 12, label: 'IIoT',          title: 'Industrial IoT Solutions',                                            icon: <FaIndustry />      },
  { id: 13, label: 'Security',      title: 'Fire and Security Alarm System',                                      icon: <FaShieldAlt />     },
  { id: 14, label: 'Sensors',       title: 'IoT Sensor Systems and Services',                                     icon: <FaMicrochip />     },
  { id: 15, label: 'Agriculture',   title: 'Agriculture Natural Farming Contracts',                               icon: <FaSeedling />      },
  { id: 16, label: 'Fiber Optics',  title: 'OFC Networking',                                                      icon: <FaBolt />          },
];

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function BookServicePage() {
  return (
    <section id="book-service">
      {/* Header */}
      <div className="bs-header">
        <h2>Our Services</h2>
        <div className="bs-underline" />
        <p>Comprehensive technology and infrastructure solutions for every need</p>
      </div>

      {/* Grid */}
      <div className="bs-grid">
        {services.map(service => (
          <div key={service.id} className="bs-card">

            {/* Image or Icon */}
            {service.img
              ? <img src={service.img} alt={service.label} className="bs-card-img" />
              : <div className="bs-card-icon">{service.icon}</div>
            }

            {/* Body */}
            <div className="bs-card-body">
              <span className="bs-card-label">{service.label}</span>
              <h3 className="bs-card-title">{service.title}</h3>
              <a className="bs-book-btn" href="#contact">
                Book Now <ArrowIcon />
              </a>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
