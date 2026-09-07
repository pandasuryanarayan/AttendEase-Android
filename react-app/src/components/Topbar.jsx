// src/components/Topbar.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { CalendarBadgeIcon } from './Icons';

export const Topbar = ({ pageTitle }) => {
  const { setSidebarOpen } = useApp();
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fullDateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header className="topbar">
      <button
        className="hamburger"
        id="hamburger"
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label="Toggle Navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className="topbar-title">{pageTitle}</div>
      <div className="topbar-right">
        <span className="date-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
          <CalendarBadgeIcon size={16} />
          <span>{fullDateStr}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{timeStr}</span>
        </span>
      </div>
    </header>
  );
};
