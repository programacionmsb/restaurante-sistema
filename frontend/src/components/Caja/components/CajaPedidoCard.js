import React from 'react';
import { DollarSign } from 'lucide-react';
import { formatHora } from '../utils/cajaHelpers';

export const CajaPedidoCard = ({ pedido, onCobrar }) => {
  return (
    <div className="caja-pedido-card">
      <div className="caja-pedido-header">
        <div>
          <div className="caja-pedido-mesa">Mesa {pedido.mesa}</div>
          <div className="caja-pedido-cliente">{pedido.cliente}</div>
        </div>
        <div className="caja-pedido-hora">{formatHora(pedido.createdAt)}</div>
      </div>

      <div className="caja-pedido-items">
        {pedido.items.slice(0, 3).map((item, index) => (
          <div key={index} className="caja-pedido-item">
            <span>{item.nombre}</span>
            <span>x{item.cantidad}</span>
          </div>
        ))}
        {pedido.items.length > 3 && (
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>
            +{pedido.items.length - 3} items más
          </div>
        )}
      </div>

      <div className="caja-pedido-total">
        <span>Total:</span>
        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
          S/ {pedido.total.toFixed(2)}
        </span>
      </div>

      <button onClick={() => onCobrar(pedido)} className="caja-btn-cobrar">
        <DollarSign size={20} />
        Cobrar
      </button>
    </div>
  );
};