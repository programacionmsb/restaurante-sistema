import React from 'react';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { formatearMoneda, formatearFecha } from '../utils/creditosHelpers';

export const CreditosDetalleCliente = ({ 
  cliente, 
  pedidos, 
  resumen, 
  onVolver, 
  onCobrar 
}) => {
  return (
    <>
      <div className="creditos-header">
        <button className="creditos-btn-back" onClick={onVolver}>
          <ArrowLeft size={20} />
        </button>
        <div className="creditos-header-content">
          <div className="creditos-cliente-avatar-grande">
            {cliente.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1>{cliente.nombre}</h1>
            {cliente.telefono && <p>📱 {cliente.telefono}</p>}
          </div>
        </div>
      </div>

      {resumen && (
        <div className="creditos-resumen-cliente">
          <div className="creditos-resumen-card">
            <span className="creditos-resumen-label">Total Original</span>
            <span className="creditos-resumen-valor">{formatearMoneda(resumen.totalOriginal)}</span>
          </div>
          <div className="creditos-resumen-card creditos-resumen-pagado">
            <span className="creditos-resumen-label">Pagado</span>
            <span className="creditos-resumen-valor">{formatearMoneda(resumen.totalPagado)}</span>
          </div>
          <div className="creditos-resumen-card creditos-resumen-deuda">
            <span className="creditos-resumen-label">Deuda Actual</span>
            <span className="creditos-resumen-valor">{formatearMoneda(resumen.totalDeuda)}</span>
          </div>
        </div>
      )}

      <div className="creditos-acciones">
        <button className="creditos-btn-cobrar" onClick={onCobrar}>
          <DollarSign size={20} />
          Cobrar Crédito
        </button>
      </div>

      <div className="creditos-pedidos-lista">
        <h2>Pedidos ({pedidos.length})</h2>
        {pedidos.map((pedido, idx) => (
          <div key={idx} className="creditos-pedido-card">
            <div className="creditos-pedido-header">
              <div>
                <span className="creditos-pedido-mesa">{pedido.mesa}</span>
                <span className="creditos-pedido-fecha">{formatearFecha(pedido.fecha)}</span>
              </div>
              <span className={`creditos-pedido-estado creditos-estado-${pedido.estadoPago}`}>
                {pedido.estadoPago === 'credito' ? 'Crédito' : 'Pago Parcial'}
              </span>
            </div>
            <div className="creditos-pedido-montos">
              <div className="creditos-pedido-monto">
                <span>Total:</span>
                <strong>{formatearMoneda(pedido.total)}</strong>
              </div>
              {pedido.montoPagado > 0 && (
                <div className="creditos-pedido-monto creditos-monto-pagado">
                  <span>Pagado:</span>
                  <strong>{formatearMoneda(pedido.montoPagado)}</strong>
                </div>
              )}
              <div className="creditos-pedido-monto creditos-monto-resta">
                <span>Resta:</span>
                <strong>{formatearMoneda(pedido.montoRestante)}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};