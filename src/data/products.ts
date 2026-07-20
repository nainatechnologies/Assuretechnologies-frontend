export type Product = {
  id: string;
  name: string;
  service: string;
  price: number;
  originalPrice: number;
  discount: number;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
};

export const CATEGORIES = [
  'All', 'Networking', 'Automation', 'Surveillance', 'Telephony',
  'Solar', 'Security', 'IT Support', 'Intercom', 'Fiber Optics',
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Cat6 Ethernet Cable – 305m', service: 'Networking', price: 4500, originalPrice: 5500, discount: 18,
    description: 'High-quality UTP Cat6 cable box for structured cabling.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', rating: 4.3, reviewCount: 128, inStock: true,
  },
  {
    id: 'p2', name: 'Gigabit Managed Switch – 24 Port', service: 'Networking', price: 12500, originalPrice: 15000, discount: 17,
    description: '24-port Gigabit smart managed switch for enterprise LAN.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop', rating: 4.6, reviewCount: 89, inStock: true,
  },
  {
    id: 'p3', name: 'Smart Sliding Gate Motor', service: 'Automation', price: 18000, originalPrice: 22000, discount: 18,
    description: 'Heavy-duty automatic sliding gate motor with two remotes.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', rating: 4.1, reviewCount: 54, inStock: true,
  },
  {
    id: 'p4', name: 'Smart Home Control Hub', service: 'Automation', price: 6500, originalPrice: 8000, discount: 19,
    description: 'Centralized hub for smart home devices and lighting control.',
    image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop', rating: 4.5, reviewCount: 203, inStock: true,
  },
  {
    id: 'p5', name: '4K IP Dome Camera', service: 'Surveillance', price: 3500, originalPrice: 4500, discount: 22,
    description: 'Vandal-proof 4K IP camera with 30m night vision.',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=400&fit=crop', rating: 4.7, reviewCount: 312, inStock: true,
  },
  {
    id: 'p6', name: '16-Channel NVR – 4TB', service: 'Surveillance', price: 14000, originalPrice: 18000, discount: 22,
    description: 'Network Video Recorder for up to 16 cameras with 4TB HDD.',
    image: 'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=400&h=400&fit=crop', rating: 4.4, reviewCount: 76, inStock: true,
  },
  {
    id: 'p7', name: 'Digital EPABX – 32 Ext', service: 'Telephony', price: 22000, originalPrice: 28000, discount: 21,
    description: 'Digital EPABX system supporting 32 extensions.',
    image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=400&fit=crop', rating: 4.2, reviewCount: 41, inStock: true,
  },
  {
    id: 'p8', name: 'Executive IP Phone', service: 'Telephony', price: 5500, originalPrice: 7000, discount: 21,
    description: 'HD voice IP phone with colour display and PoE support.',
    image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=400&fit=crop', rating: 4.0, reviewCount: 67, inStock: true,
  },
  {
    id: 'p9', name: 'Mono Solar Panel – 400W', service: 'Solar', price: 9000, originalPrice: 12000, discount: 25,
    description: 'High-efficiency 400W monocrystalline solar panel.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop', rating: 4.8, reviewCount: 256, inStock: true,
  },
  {
    id: 'p10', name: 'Hybrid Solar Inverter – 5kVA', service: 'Solar', price: 38000, originalPrice: 45000, discount: 16,
    description: 'Smart hybrid inverter with built-in MPPT and battery management.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop', rating: 4.6, reviewCount: 134, inStock: true,
  },
  {
    id: 'p11', name: 'Smart Smoke Detector', service: 'Security', price: 1800, originalPrice: 2500, discount: 28,
    description: 'Wi-Fi smart smoke and carbon monoxide detector with app alerts.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop', rating: 4.3, reviewCount: 98, inStock: true,
  },
  {
    id: 'p12', name: 'Biometric Access Controller', service: 'Security', price: 11000, originalPrice: 14000, discount: 21,
    description: 'Fingerprint + RFID door access control unit.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop', rating: 4.5, reviewCount: 156, inStock: true,
  },
  {
    id: 'p13', name: 'Wireless Access Point – AC1200', service: 'Networking', price: 3200, originalPrice: 4000, discount: 20,
    description: 'Dual-band ceiling-mount wireless AP for enterprise Wi-Fi.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop', rating: 4.4, reviewCount: 187, inStock: true,
  },
  {
    id: 'p14', name: 'Boom Barrier – Heavy Duty', service: 'Automation', price: 35000, originalPrice: 42000, discount: 17,
    description: 'Automatic boom barrier with vehicle loop detector and manual release.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', rating: 4.2, reviewCount: 33, inStock: true,
  },
  {
    id: 'p15', name: 'PTZ Outdoor Camera – 5MP', service: 'Surveillance', price: 8500, originalPrice: 11000, discount: 23,
    description: '360° pan-tilt-zoom outdoor camera with auto-tracking.',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=400&fit=crop', rating: 4.6, reviewCount: 204, inStock: true,
  },
  {
    id: 'p16', name: 'Solar Street Light – 100W', service: 'Solar', price: 4500, originalPrice: 6000, discount: 25,
    description: 'All-in-one solar LED street light with motion sensor.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop', rating: 4.5, reviewCount: 143, inStock: true,
  },
  {
    id: 'p17', name: 'Fire Alarm Control Panel', service: 'Security', price: 15000, originalPrice: 19000, discount: 21,
    description: '8-zone conventional fire alarm panel with battery backup.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop', rating: 4.3, reviewCount: 62, inStock: true,
  },
  {
    id: 'p18', name: 'Laptop – Core i5 Business', service: 'IT Support', price: 42000, originalPrice: 52000, discount: 19,
    description: '14" FHD business laptop, 16GB RAM, 512GB SSD.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', rating: 4.4, reviewCount: 289, inStock: true,
  },
  {
    id: 'p19', name: 'All-in-One Laser Printer', service: 'IT Support', price: 18000, originalPrice: 22000, discount: 18,
    description: 'Print, scan, copy, fax with duplex and Wi-Fi.',
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=400&fit=crop', rating: 4.1, reviewCount: 97, inStock: true,
  },
  {
    id: 'p20', name: 'Video Door Phone – 7"', service: 'Intercom', price: 6500, originalPrice: 8500, discount: 24,
    description: '7-inch colour video door phone with night vision camera.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop', rating: 4.3, reviewCount: 112, inStock: true,
  },
  {
    id: 'p21', name: 'Fiber Optic Patch Cord – LC/LC', service: 'Fiber Optics', price: 350, originalPrice: 500, discount: 30,
    description: 'Single-mode duplex fiber patch cord, 3m length.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop', rating: 4.7, reviewCount: 445, inStock: true,
  },
  {
    id: 'p22', name: 'OTDR – Optical Time Domain Reflectometer', service: 'Fiber Optics', price: 85000, originalPrice: 99000, discount: 14,
    description: 'Professional OTDR for fiber cable testing and fault detection.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop', rating: 4.8, reviewCount: 28, inStock: true,
  },
  {
    id: 'p23', name: 'Multi-Apartment Intercom System', service: 'Intercom', price: 25000, originalPrice: 32000, discount: 22,
    description: '8-apartment audio/video intercom with gate release.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop', rating: 4.2, reviewCount: 45, inStock: true,
  },
  {
    id: 'p24', name: 'Network Rack – 42U Floor Standing', service: 'Networking', price: 16000, originalPrice: 20000, discount: 20,
    description: '42U server rack with fans, PDU and cable management.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop', rating: 4.5, reviewCount: 78, inStock: true,
  },
];
