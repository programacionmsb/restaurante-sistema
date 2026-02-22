import React from 'react';
import { X } from 'lucide-react';
import { formatearMoneda } from '../utils/creditosHelpers';

export const CreditosModalPago = ({
  mostrar,
  tipoPago,
  setTipoPago,
  montoPago,
  setMontoPago,
  metodoPago,
  setMetodoPago,
  resumenCliente,
  procesando,
  onCerrar,
  onConfirmar
}) => {
  if (!mostrar) return null;

  return (
    <div className="creditos-modal-overlay" onClick={onCerrar}>
      <div className="creditos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="creditos-modal-header">
          <h2>Cobrar Crédito</h2>
          <button className="creditos-modal-cerrar" onClick={onCerrar}>
            <X size={24} />
          </button>
        </div>

        <div className="creditos-modal-body">
          <div className="creditos-form-group">
            <label>Tipo de Pago</label>
            <div className="creditos-radio-group">
              <label className="creditos-radio">
                <input
                  type="radio"
                  value="todo"
                  checked={tipoPago === 'todo'}
                  onChange={(e) => setTipoPago(e.target.value)}
                />
                <span>Pagar Todo ({formatearMoneda(resumenCliente?.totalDeuda || 0)})</span>
              </label>
              <label className="creditos-radio">
                <input
                  type="radio"
                  value="parcial"
                  checked={tipoPago === 'parcial'}
                  onChange={(e) => setTipoPago(e.target.value)}
                />
                <span>Pago Parcial</span>
              </label>
            </div>
          </div>

          {tipoPago === 'parcial' && (
            <div className="creditos-form-group">
              <label>Monto a Pagar *</label>
              <div className="creditos-input-money">
                <span>S/</span>
                <input
                  type="number"
                  step="0.01"
                  value={montoPago}
                  onChange={(e) => setMontoPago(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <small>Deuda total: {formatearMoneda(resumenCliente?.totalDeuda || 0)}</small>
            </div>
          )}

          <div className="creditos-form-group">
            <label>Método de Pago *</label>
            <div className="creditos-metodos-pago">
              <button
                className={`creditos-metodo-btn ${metodoPago === 'efectivo' ? 'active' : ''}`}
                onClick={() => setMetodoPago('efectivo')}
              >
                💵 Efectivo
              </button>
              <button
                className={`creditos-metodo-btn ${metodoPago === 'yape' ? 'active' : ''}`}
                onClick={() => setMetodoPago('yape')}
              >
                📱 Yape
              </button>
              <button
                className={`creditos-metodo-btn ${metodoPago === 'transferencia' ? 'active' : ''}`}
                onClick={() => setMetodoPago('transferencia')}
              >
                🏦 Transferencia
              </button>
            </div>
          </div>

          {tipoPago === 'parcial' && montoPago && (
            <div className="creditos-preview">
              <p><strong>Se aplicará algoritmo FIFO:</strong></p>
              <p>Los pedidos más antiguos se pagarán primero</p>
            </div>
          )}
        </div>

        <div className="creditos-modal-footer">
          <button className="creditos-btn-cancelar" onClick={onCerrar}>
            Cancelar
          </button>
          <button 
            className="creditos-btn-confirmar" 
            onClick={onConfirmar}
            disabled={procesando}
          >
            {procesando ? 'Procesando...' : 'Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};