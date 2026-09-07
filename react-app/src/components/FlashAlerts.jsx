// src/components/FlashAlerts.jsx
import React from 'react';
import { useApp } from '../context/AppContext';

export const FlashAlerts = () => {
  const { flashes, removeFlash } = useApp();

  if (!flashes || flashes.length === 0) return null;

  return (
    <div className="flash-container">
      {flashes.map((f) => (
        <div key={f.id} className={`flash flash-${f.category}`}>
          <span>{f.message}</span>
          <button type="button" onClick={() => removeFlash(f.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
