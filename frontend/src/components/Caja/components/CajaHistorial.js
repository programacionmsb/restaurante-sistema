import React from 'react';
import { DollarSign, Smartphone, CreditCard, XCircle } from 'lucide-react';
import { formatHora } from '../utils/cajaHelpers';

export const CajaHistorial = ({ pedidosPagados }) => {
  if (pedidosPagados.length === 0) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '3rem', 
        borderRadius: '1rem', 
        textAlign: 'center',
        color: '#9ca3af',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <XCircle size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No hay pagos registrados</p>
        <p style={{ fontSize: '0.875rem' }}>Los pagos aparecerán aquí una vez cobrados</p>
      </div>
    );
  }

  return (
    <div className="caja-historial">
      {pedidosPagados.map((pedido) => (
        <div key={pedido._id} className="caja-historial-item">
          <div className="caja-historial-info">
            <div>
              <span className="caja-historial-mesa">Mesa {pedido.mesa}</span>
              <span className="caja-historial-cliente">{pedido.cliente}</span>
            </div>
            <div className="caja-historial-hora">{formatHora(pedido.createdAt)}</div>
          </div>

          <div className="caja-historial-metodo">
            {pedido.metodoPago === 'efectivo' && <DollarSign size={16} color="#059669" />}
            {pedido.metodoPago === 'yape' && <Smartphone size={16} color="#2563eb" />}
            {pedido.metodoPago === 'transferencia' && <CreditCard size={16} color="#7c3aed" />}
            <span style={{ textTransform: 'capitalize' }}>{pedido.metodoPago}</span>
          </div>

          <div className="caja-historial-total">S/ {pedido.total.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
};