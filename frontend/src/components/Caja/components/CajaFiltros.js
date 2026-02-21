import React from 'react';
import { Calendar } from 'lucide-react';

export const CajaFiltros = ({ filtroFecha, onCambiarFiltro, fechaPersonalizada, onCambiarFecha }) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem', 
      marginBottom: '2rem',
      flexWrap: 'wrap',
      padding: '1rem',
      background: 'white',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <button
        onClick={() => onCambiarFiltro('hoy')}
        style={{
          padding: '0.5rem 1rem',
          background: filtroFecha === 'hoy' ? '#10b981' : '#f3f4f6',
          color: filtroFecha === 'hoy' ? 'white' : '#374151',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        Hoy
      </button>
      <button
        onClick={() => onCambiarFiltro('ayer')}
        style={{
          padding: '0.5rem 1rem',
          background: filtroFecha === 'ayer' ? '#10b981' : '#f3f4f6',
          color: filtroFecha === 'ayer' ? 'white' : '#374151',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        Ayer
      </button>
      <button
        onClick={() => onCambiarFiltro('ultimos7')}
        style={{
          padding: '0.5rem 1rem',
          background: filtroFecha === 'ultimos7' ? '#10b981' : '#f3f4f6',
          color: filtroFecha === 'ultimos7' ? 'white' : '#374151',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        Últimos 7 días
      </button>
      <button
        onClick={() => onCambiarFiltro('ultimos30')}
        style={{
          padding: '0.5rem 1rem',
          background: filtroFecha === 'ultimos30' ? '#10b981' : '#f3f4f6',
          color: filtroFecha === 'ultimos30' ? 'white' : '#374151',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        Últimos 30 días
      </button>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Calendar size={16} style={{ color: '#6b7280' }} />
        <input
          type="date"
          value={fechaPersonalizada}
          onChange={(e) => {
            onCambiarFecha(e.target.value);
            onCambiarFiltro('personalizado');
          }}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
};