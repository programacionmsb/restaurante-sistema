import React, { useState } from 'react';
import { DollarSign, Smartphone, CreditCard, Clock } from 'lucide-react';

export const ModalPago = ({ pedido, onClose, onPagar }) => {
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoPagado, setMontoPagado] = useState(pedido.total);
  const [procesando, setProcesando] = useState(false);

  const cambio = montoPagado - pedido.total;

  const handlePagar = async () => {
    if (metodoPago === 'efectivo' && montoPagado < pedido.total) {
      alert('El monto pagado no puede ser menor al total');
      return;
    }

    setProcesando(true);
    try {
      await onPagar(metodoPago);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        style={{ maxWidth: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#1f2937' }}>
          Registrar Pago
        </h3>

        <div style={{ 
          background: '#f9fafb', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280' }}>Mesa:</span>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>{pedido.mesa}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280' }}>Cliente:</span>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>{pedido.cliente}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            paddingTop: '0.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <span style={{ fontWeight: '700', color: '#1f2937' }}>Total:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
              S/ {pedido.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            Método de Pago
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              onClick={() => setMetodoPago('efectivo')}
              style={{
                padding: '1rem',
                background: metodoPago === 'efectivo' ? '#10b981' : 'white',
                color: metodoPago === 'efectivo' ? 'white' : '#374151',
                border: '2px solid #10b981',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <DollarSign size={24} />
              Efectivo
            </button>
            <button
              onClick={() => setMetodoPago('yape')}
              style={{
                padding: '1rem',
                background: metodoPago === 'yape' ? '#3b82f6' : 'white',
                color: metodoPago === 'yape' ? 'white' : '#374151',
                border: '2px solid #3b82f6',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Smartphone size={24} />
              Yape
            </button>
            <button
              onClick={() => setMetodoPago('transferencia')}
              style={{
                padding: '1rem',
                background: metodoPago === 'transferencia' ? '#8b5cf6' : 'white',
                color: metodoPago === 'transferencia' ? 'white' : '#374151',
                border: '2px solid #8b5cf6',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CreditCard size={24} />
              Transfer.
            </button>
            <button
              onClick={() => setMetodoPago('credito')}
              style={{
                padding: '1rem',
                background: metodoPago === 'credito' ? '#ef4444' : 'white',
                color: metodoPago === 'credito' ? 'white' : '#374151',
                border: '2px solid #ef4444',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Clock size={24} />
              Crédito
            </button>
          </div>
        </div>

        {metodoPago === 'credito' && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#fef2f2',
            border: '2px solid #ef4444',
            borderRadius: '0.5rem',
            color: '#991b1b',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            ⚠️ El pedido quedará registrado como crédito pendiente de cobro. Solo usuarios con permiso pueden autorizar créditos.
          </div>
        )}

        {metodoPago === 'efectivo' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Monto Recibido
            </label>
            <input
              type="number"
              value={montoPagado}
              onChange={(e) => setMontoPagado(parseFloat(e.target.value) || 0)}
              step="0.01"
              min={pedido.total}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: '600'
              }}
            />
            {cambio >= 0 && (
              <div style={{ 
                marginTop: '1rem',
                padding: '1rem',
                background: cambio > 0 ? '#fef3c7' : '#d1fae5',
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '600', color: '#78350f' }}>Cambio:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: cambio > 0 ? '#92400e' : '#059669' }}>
                  S/ {cambio.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="modal-buttons">
          <button className="btn-cancelar" onClick={onClose} disabled={procesando}>
            Cancelar
          </button>
          <button 
            className="btn-guardar" 
            onClick={handlePagar}
            disabled={procesando}
          >
            {procesando ? 'Procesando...' : metodoPago === 'credito' ? 'Registrar Crédito' : 'Registrar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};