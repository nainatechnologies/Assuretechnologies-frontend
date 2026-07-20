import React from 'react';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`brand-logo ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
      <svg width="44" height="44" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left Leg */}
        <path d="M20 4 L4 36 H12.5 L20 18 Z" fill="#0d47a1" />
        {/* Right Leg */}
        <path d="M20 4 L36 36 H27.5 L20 18 Z" fill="#1976d2" />
        {/* Inner Cyan Triangle */}
        <path d="M20 22 L13.5 36 H26.5 Z" fill="#00bcd4" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ 
          fontWeight: 700, 
          fontSize: '1.4rem', 
          lineHeight: '1.1',
          letterSpacing: '0.5px',
          color: '#1565c0'
        }}>
          ASSURE
        </span>
        <span style={{ 
          fontWeight: 600, 
          fontSize: '0.75rem', 
          lineHeight: '1.2',
          letterSpacing: '2.5px',
          color: '#475569',
          textTransform: 'uppercase'
        }}>
          TECHNOLOGIES
        </span>
      </div>
    </div>
  );
}
