import React from 'react';
import { Clock, CheckCircle, Flame, User } from 'lucide-react';
import { formatTiempo } from '../utils/cocinaHelpers';

export const CocinaPedidoCard = ({ 
  pedido, 
  tiempoTranscurrido, 
  onIniciarPreparacion, 
  onMarcarListo 
}) => {
  const esUrgente = tiempoTranscurrido > 600;

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
          <div className="cocina-pedido-mesa">Mesa {pedido.mesa}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {pedido.cliente}
          </div>
          {/* MOSTRAR MESERO */}
          {pedido.usuarioCreador && pedido.usuarioCreador.nombre && (
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

      {/* Items con observaciones */}
      <div className="cocina-pedido-items">
        {pedido.items.map((item, index) => (
          <div key={index} className="cocina-pedido-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span className="cocina-pedido-item-nombre">{item.nombre}</span>
                <span className="cocina-pedido-item-cantidad">x{item.cantidad}</span>
              </div>
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
        ))}
      </div>

      {/* Estado */}
      <div style={{ marginBottom: '1rem' }}>
        {pedido.estado === 'pendiente' && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#991b1b', 
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            ⏳ Esperando Preparación
          </div>
        )}
        {pedido.estado === 'en_preparacion' && (
          <div style={{ 
            background: '#fef3c7', 
            color: '#92400e', 
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            textAlign: 'center'
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