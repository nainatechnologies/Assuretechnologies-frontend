export function RouteLoader() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      width: '100%',
      gap: '16px'
    }}>
      <style>{`
        @keyframes assurePulse {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
        @keyframes assureSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid #e2e8f0',
        borderTop: '3px solid #4f46e5',
        borderRadius: '50%',
        animation: 'assureSpin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, letterSpacing: '0.2px' }}>
        Loading Assure...
      </span>
    </div>
  );
}
