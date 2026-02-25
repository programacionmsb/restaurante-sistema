import React, { useState } from 'react';

export const CocinaEstadisticas = ({
  pedidosPendientes,
  pedidosEnPreparacion,
  totalPedidos,
  itemsStats,
  clientes,
  filtroCliente,
  onCambiarFiltroCliente,
  statsTipo,
}) => {
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

      {/* Estadísticas por Tipo */}
      {statsTipo && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '2px solid #e0f2fe'
          }}>
            <span style={{ fontSize: '2rem' }}>🪑</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Mesa</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0284c7' }}>{statsTipo.MESA}</div>
            </div>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '2px solid #fef9c3'
          }}>
            <span style={{ fontSize: '2rem' }}>🛵</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Delivery</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ca8a04' }}>{statsTipo.DELIVERY}</div>
            </div>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1rem 1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '2px solid #f3e8ff'
          }}>
            <span style={{ fontSize: '2rem' }}>📦</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Otro</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#7c3aed' }}>{statsTipo.OTRO}</div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de Platos */}
      {itemsStats.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {/* Header con combobox */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📊 Resumen de Platos
            </h3>

            {/* Combobox de clientes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
                Ver por:
              </label>
              <select
                value={filtroCliente}
                onChange={(e) => onCambiarFiltroCliente(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  background: 'white',
                  cursor: 'pointer',
                  minWidth: '180px'
                }}
              >
                <option value="todos">Todos los clientes</option>
                {clientes.map(cliente => (
                  <option key={cliente} value={cliente}>{cliente}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Badge cliente seleccionado */}
          {filtroCliente !== 'todos' && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#dbeafe',
              color: '#1e40af',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              👤 Mostrando: {filtroCliente}
              <button
                onClick={() => onCambiarFiltroCliente('todos')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#1e40af',
                  fontWeight: '700',
                  fontSize: '1rem',
                  padding: 0,
                  lineHeight: 1
                }}
                title="Limpiar filtro"
              >
                ×
              </button>
            </div>
          )}

          {/* Grid de items */}
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
                border: `2px solid ${item.categoria === 'Entrada' ? '#86efac' : item.categoria === 'Plato Principal' ? '#93c5fd' : '#e5e7eb'}`
              }}>
                {/* Badge categoría */}
                {item.categoria && (
                  <div style={{
                    display: 'inline-block',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '0.25rem',
                    marginBottom: '0.4rem',
                    background: item.categoria === 'Entrada' ? '#d1fae5' : '#dbeafe',
                    color: item.categoria === 'Entrada' ? '#065f46' : '#1e40af',
                  }}>
                    {item.categoria === 'Entrada' ? '🥗' : '🍽️'} {item.categoria.toUpperCase()}
                  </div>
                )}

                <div style={{
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  fontSize: '0.95rem'
                }}>
                  {item.nombre}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Pendiente</div>
                    <div style={{ fontWeight: '700', color: '#ef4444', fontSize: '1.25rem' }}>
                      {item.totalPendiente}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>En Prep.</div>
                    <div style={{ fontWeight: '700', color: '#f59e0b', fontSize: '1.25rem' }}>
                      {item.totalEnPreparacion}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Total</div>
                    <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '1.25rem' }}>
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