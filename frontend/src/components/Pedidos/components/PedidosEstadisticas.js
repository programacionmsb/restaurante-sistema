import React from 'react';

export const PedidosEstadisticas = ({ estadisticas }) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Pedidos</div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>{estadisticas.total}</div>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Pendientes</div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>{estadisticas.pendientes}</div>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>En Preparación</div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>{estadisticas.enPreparacion}</div>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Por Cobrar</div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>{estadisticas.porCobrar}</div>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Ventas</div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>S/ {estadisticas.totalVentas.toFixed(2)}</div>
      </div>
    </div>
  );
};