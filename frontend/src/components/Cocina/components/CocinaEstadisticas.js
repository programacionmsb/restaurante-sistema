import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ========== COMPONENTE BLOQUE COLAPSABLE ==========
const BloqueColapsable = ({ titulo, children, defaultAbierto = true }) => {
  const [abierto, setAbierto] = useState(defaultAbierto);

  return (
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Header clickeable */}
      <div
        onClick={() => setAbierto(!abierto)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          cursor: 'pointer',
          userSelect: 'none',
          background: abierto ? 'white' : '#f9fafb',
          borderBottom: abierto ? '1px solid #f3f4f6' : 'none',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: '#1f2937' }}>
          {titulo}
        </h3>
        <div style={{
          background: '#f3f4f6',
          borderRadius: '0.375rem',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          color: '#6b7280'
        }}>
          {abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Contenido */}
      {abierto && (
        <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ========== GRID DE ITEMS ==========
const ItemsGrid = ({ items }) => {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.875rem' }}>
        No hay platos para mostrar
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
      {items.map((item, index) => (
        <div key={index} style={{
          background: '#f9fafb',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: `2px solid ${item.categoria === 'Entrada' ? '#86efac' : item.categoria === 'Plato Principal' ? '#93c5fd' : '#e5e7eb'}`
        }}>
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
          <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            {item.nombre}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Pendiente</div>
              <div style={{ fontWeight: '700', color: '#ef4444', fontSize: '1.25rem' }}>{item.totalPendiente}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>En Prep.</div>
              <div style={{ fontWeight: '700', color: '#f59e0b', fontSize: '1.25rem' }}>{item.totalEnPreparacion}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Total</div>
              <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '1.25rem' }}>{item.totalGeneral}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ========== HELPER DISPLAY DESTINO ==========
const formatDestino = (mesa) => {
  if (!mesa) return mesa;
  if (mesa.startsWith('MESA:')) return `🪑 ${mesa.replace('MESA:', '').trim()}`;
  if (mesa.startsWith('DELIVERY:')) return `🛵 ${mesa.replace('DELIVERY:', '').trim()}`;
  if (mesa.startsWith('OTRO:')) return `📦 ${mesa.replace('OTRO:', '').trim()}`;
  return mesa;
};

// ========== COMPONENTE PRINCIPAL ==========
export const CocinaEstadisticas = ({
  pedidosPendientes,
  pedidosEnPreparacion,
  totalPedidos,
  itemsStats,
  clientes,
  filtroCliente,
  onCambiarFiltroCliente,
  itemsStatsPorDestino,
  destinos = [],
  filtroDestino,
  onCambiarFiltroDestino,
}) => {
  return (
    <>
      {/* ===== BLOQUE 1: Estadísticas de Pedidos ===== */}
      <BloqueColapsable titulo="📊 Estadísticas de Pedidos">
        <div className="cocina-stats" style={{ marginBottom: 0 }}>
          <div className="cocina-stat-card">
            <div className="cocina-stat-label">Pendientes</div>
            <div className="cocina-stat-value" style={{ color: '#ef4444' }}>{pedidosPendientes}</div>
          </div>
          <div className="cocina-stat-card">
            <div className="cocina-stat-label">En Preparación</div>
            <div className="cocina-stat-value" style={{ color: '#f59e0b' }}>{pedidosEnPreparacion}</div>
          </div>
          <div className="cocina-stat-card">
            <div className="cocina-stat-label">Total Activos</div>
            <div className="cocina-stat-value" style={{ color: '#1f2937' }}>{totalPedidos}</div>
          </div>
        </div>
      </BloqueColapsable>

      {/* ===== BLOQUE 2: Resumen de Platos por Cliente ===== */}
      {itemsStats.length > 0 && (
        <BloqueColapsable titulo="👥 Resumen de Platos por Cliente">
          {/* Combobox clientes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>Ver por:</label>
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
            {filtroCliente !== 'todos' && (
              <button
                onClick={() => onCambiarFiltroCliente('todos')}
                style={{
                  background: '#dbeafe', color: '#1e40af', border: 'none',
                  borderRadius: '0.375rem', padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.25rem'
                }}
              >
                👤 {filtroCliente} &times;
              </button>
            )}
          </div>
          <ItemsGrid items={itemsStats} />
        </BloqueColapsable>
      )}

      {/* ===== BLOQUE 3: Resumen de Platos por Destino ===== */}
      {itemsStatsPorDestino.length > 0 && (
        <BloqueColapsable titulo="🗺️ Resumen de Platos por Destino">
          {/* Combobox destino */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>Ver por:</label>
            <select
              value={filtroDestino}
              onChange={(e) => onCambiarFiltroDestino(e.target.value)}
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
              <option value="todos">Todos los destinos</option>
              {destinos.map(destino => (
                <option key={destino} value={destino}>{formatDestino(destino)}</option>
              ))}
            </select>
            {filtroDestino !== 'todos' && (
              <button
                onClick={() => onCambiarFiltroDestino('todos')}
                style={{
                  background: '#fef3c7', color: '#92400e', border: 'none',
                  borderRadius: '0.375rem', padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                {formatDestino(filtroDestino)} &times;
              </button>
            )}
          </div>
          <ItemsGrid items={itemsStatsPorDestino} />
        </BloqueColapsable>
      )}
    </>
  );
};