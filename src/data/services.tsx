import React from 'react';
// icons removed as we are using unsplash images now
import svcNetworking from '../assets/svc_networking.png';
import svcAutomation from '../assets/svc_automation.png';
import svcAgritech from '../assets/svc_agritech.png';
import svcSurveillance from '../assets/svc_surveillance.png';
import svcTelephony from '../assets/svc_telephony.png';
import svcIntercom from '../assets/svc_intercom.png';
import svcBiometrics from '../assets/svc_biometrics.png';

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'dropdown';
  options?: string[]; // Used when type is 'dropdown'
  required: boolean;
}

export type Service = {
  id: number;
  label: string;
  title: string;
  img?: string;
  icon?: React.ReactNode;
  customFields?: CustomField[];
  prebookingCharge?: number;
};

export const SERVICES: Service[] = [
  { 
    id: 1, 
    label: 'Networking', 
    title: 'Industrial Internet and Local Area Networking Solutions', 
    img: svcNetworking,
    customFields: [
      { id: 'cf1', label: 'Network Size (approx sq ft)', type: 'number', required: true },
      { id: 'cf2', label: 'Preferred Cable Type', type: 'dropdown', options: ['Cat6', 'Cat6a', 'Fiber Optic', 'Not Sure'], required: false }
    ]
  },
  { id: 2, label: 'Automation', title: 'Home, Gate, Boom Barrier Automation and Solutions', img: svcAutomation },
  { id: 3, label: 'AgriTech', title: 'Agriculture and Aquaculture IoT Tools and Automation', img: svcAgritech },
  { id: 17, label: 'AgriTech', title: 'Agriculture Drone Spraying Services', img: svcAgritech, prebookingCharge: 500 },
  { id: 18, label: 'AgriTech', title: 'Agriculture Tractor Services', img: svcAgritech },
  { id: 4, label: 'Surveillance', title: 'CCTV Networking and AMC Contract', img: svcSurveillance },
  { id: 5, label: 'Telephony', title: 'EPABX System', img: svcTelephony },
  { id: 6, label: 'Intercom', title: 'Intercom System', img: svcIntercom },
  { id: 7, label: 'Biometrics', title: 'Biometric & Attendance System', img: svcBiometrics },
  { id: 8, label: 'Communication', title: 'Walkie Talkies, Signal Booster, Signal Jammer, Satellite Phone Solutions', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=500&fit=crop' },
  { id: 9, label: 'Infrastructure', title: 'Server Racks and Cable Structuring', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=500&fit=crop' },
  { id: 10, label: 'IT Support', title: 'Computer, Laptop, Printer Sales, Service & AMC Contract', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop' },
  { id: 11, label: 'Solar', title: 'Solar Power Solutions', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop' },
  { id: 12, label: 'IIoT', title: 'Industrial IoT Solutions', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=500&fit=crop' },
  { id: 13, label: 'Security', title: 'Fire and Security Alarm System', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop' },
  { id: 14, label: 'Sensors', title: 'IoT Sensor Systems and Services', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=500&fit=crop' },
  { id: 15, label: 'Agriculture', title: 'Agriculture Natural Farming Contracts', img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&h=500&fit=crop' },
  { id: 16, label: 'Fiber Optics', title: 'OFC Networking', img: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=500&h=500&fit=crop' },
];
