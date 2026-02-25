import React from 'react';
import { Clock, CheckCircle, Flame, User } from 'lucide-react';
import { formatTiempo } from '../utils/cocinaHelpers';

const CATEGORIAS_COCINA = ['Entrada', 'Plato Principal'];

const filtrarItemsCocina = (items) => {
  return items.filter(item => {
    // Items normales (no de menú): siempre mostrar
    if (!item.esMenuExpandido) return true;
    // Items de menú: solo Entrada y Plato Principal
    return CATEGORIAS_COCINA.includes(item.categoria);
  });
};

const getBadgeCategoria = (categoria) => {
  const badges = {
    'Entrada':        { emoji: '🥗', color: '#d1fae5', texto: '#065f46' },
    'Plato Principal':{ emoji: '🍽️', color: '#dbeafe', texto: '#1e40af' },
  };
  return badges[categoria] || null;
};

export const CocinaPedidoCard = ({ 
  pedido, 
  tiempoTranscurrido, 
  onIniciarPreparacion, 
  onMarcarListo 
}) => {
  const esUrgente = tiempoTranscurrido > 600;
  const itemsCocina = filtrarItemsCocina(pedido.items);

  return (
    <div className={`cocina-pedido-card ${pedido.estado}`}>
      {esUrgente && pedido.estado === 'en_preparacion' && (
        <div className="cocina-pedido-urgente">
          <Flame size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
          URGENTE
        </div>
      )}

      {/* Header */}
      <div className="cocina-pedido-header">
        <div>
          <div className="cocina-pedido-mesa">
            {pedido.mesa?.startsWith('DELIVERY:') ? `🛵 ${pedido.mesa}`
            : pedido.mesa?.startsWith('OTRO:') ? `📦 ${pedido.mesa}`
            : `🪑 ${pedido.mesa}`}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {pedido.cliente}
          </div>
          {pedido.usuarioCreador?.nombre && (
            <div style={{
              fontSize: '0.75rem',
              color: '#667eea',
              fontWeight: '600',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: '#ede9fe',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              width: 'fit-content'
            }}>
              <User size={12} />
              {pedido.usuarioCreador.nombre}
            </div>
          )}
        </div>
        <div className="cocina-pedido-tiempo">
          <div className="cocina-pedido-tiempo-transcurrido">
            {formatTiempo(tiempoTranscurrido)}
          </div>
          <div className="cocina-pedido-tiempo-label">
            <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
            {pedido.estado === 'pendiente' ? 'Esperando' : 'Preparando'}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="cocina-pedido-items">
        {itemsCocina.map((item, index) => {
          const badge = item.esMenuExpandido ? getBadgeCategoria(item.categoria) : null;

          return (
            <div key={index} className="cocina-pedido-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexDirection: 'column', gap: '0.25rem' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="cocina-pedido-item-nombre">{item.nombre}</span>
                  <span className="cocina-pedido-item-cantidad">x{item.cantidad}</span>
                </div>

                {/* Badge de categoría si es item de menú */}
                {badge && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '0.25rem',
                      background: badge.color,
                      color: badge.texto,
                    }}>
                      {badge.emoji} {item.categoria.toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      color: '#9ca3af',
                      fontStyle: 'italic',
                    }}>
                      📋 {item.menuNombre}
                    </span>
                  </div>
                )}

                {/* Observaciones */}
                {item.observaciones && (
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#ef4444',
                    fontStyle: 'italic',
                    background: '#fee2e2',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px dashed #ef4444'
                  }}>
                    📝 {item.observaciones}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado */}
      <div style={{ marginBottom: '1rem' }}>
        {pedido.estado === 'pendiente' && (
          <div style={{ 
            background: '#fee2e2', color: '#991b1b', 
            padding: '0.5rem 1rem', borderRadius: '0.5rem',
            fontWeight: '600', textAlign: 'center'
          }}>
            ⏳ Esperando Preparación
          </div>
        )}
        {pedido.estado === 'en_preparacion' && (
          <div style={{ 
            background: '#fef3c7', color: '#92400e', 
            padding: '0.5rem 1rem', borderRadius: '0.5rem',
            fontWeight: '600', textAlign: 'center'
          }}>
            🔥 En Preparación
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="cocina-pedido-acciones">
        {pedido.estado === 'pendiente' && (
          <button 
            className="btn-cocina-accion btn-iniciar-preparacion"
            onClick={() => onIniciarPreparacion(pedido._id)}
          >
            <Flame size={20} />
            Iniciar Preparación
          </button>
        )}
        {pedido.estado === 'en_preparacion' && (
          <button 
            className="btn-cocina-accion btn-marcar-listo"
            onClick={() => onMarcarListo(pedido._id)}
          >
            <CheckCircle size={20} />
            Marcar como Listo
          </button>
        )}
      </div>
    </div>
  );
};