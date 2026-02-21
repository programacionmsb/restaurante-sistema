import React from 'react';

export const CocinaEstadisticas = ({ pedidosPendientes, pedidosEnPreparacion, totalPedidos, itemsStats }) => {
  return (
    <>
      {/* Estadísticas de Pedidos */}
      <div className="cocina-stats">
        <div className="cocina-stat-card">
          <div className="cocina-stat-label">Pendientes</div>
          <div className="cocina-stat-value" style={{ color: '#ef4444' }}>
            {pedidosPendientes}
          </div>
        </div>
        <div className="cocina-stat-card">
          <div className="cocina-stat-label">En Preparación</div>
          <div className="cocina-stat-value" style={{ color: '#f59e0b' }}>
            {pedidosEnPreparacion}
          </div>
        </div>
        <div className="cocina-stat-card">
          <div className="cocina-stat-label">Total Activos</div>
          <div className="cocina-stat-value" style={{ color: '#1f2937' }}>
            {totalPedidos}
          </div>
        </div>
      </div>

      {/* Estadísticas de Items */}
      {itemsStats.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            color: '#1f2937', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📊 Resumen de Platos
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {itemsStats.map((item, index) => (
              <div key={index} style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '2px solid #e5e7eb'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  fontSize: '0.95rem'
                }}>
                  {item.nombre}
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.75rem',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Pendiente</div>
                    <div style={{ 
                      fontWeight: '700', 
                      color: '#ef4444',
                      fontSize: '1.25rem'
                    }}>
                      {item.totalPendiente}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>En Prep.</div>
                    <div style={{ 
                      fontWeight: '700', 
                      color: '#f59e0b',
                      fontSize: '1.25rem'
                    }}>
                      {item.totalEnPreparacion}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Total</div>
                    <div style={{ 
                      fontWeight: '700', 
                      color: '#1f2937',
                      fontSize: '1.25rem'
                    }}>
                      {item.totalGeneral}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};