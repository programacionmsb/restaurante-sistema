import React from 'react';
import { Calendar, CheckCircle, DollarSign, Edit2, XCircle } from 'lucide-react';
import { authAPI } from '../../../services/apiAuth';
import ProtectedAction from '../../ProtectedAction';
import { formatFechaCompleta, formatHoraSola, calcularTiempoPreparacion, getEstadoLabel, getNombreUsuario } from '../utils/pedidosHelpers';

export const PedidoCard = ({ 
  pedido, 
  onUpdateEstado, 
  onRegistrarPago, 
  onCancelar, 
  onEditar 
}) => {
  return (
    <div className={`pedido-card ${pedido.estado} ${pedido.cancelado ? 'cancelado' : ''}`}>
      <div className="pedido-header">
        <div>
          <div className="pedido-mesa">{pedido.mesa}</div>
          <div className="pedido-cliente">{pedido.cliente}</div>
        </div>
      </div>

      {/* Información de tiempos */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem',
        marginBottom: '1rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '0.5rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <span style={{ color: '#6b7280', fontWeight: '600' }}>Fecha</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={14} style={{ color: '#6b7280' }} />
            <span style={{ fontWeight: '600', color: '#1f2937' }}>
              {formatFechaCompleta(pedido.createdAt)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6b7280' }}>Pedido:</span>
          <span style={{ fontWeight: '600', color: '#1f2937' }}>
            {formatHoraSola(pedido.createdAt)}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6b7280' }}>Preparación:</span>
          <span style={{ fontWeight: '600', color: '#1f2937' }}>
            {formatHoraSola(pedido.inicioPreparacion)}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6b7280' }}>Listo:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>
              {formatHoraSola(pedido.finPreparacion)}
            </span>
            {pedido.inicioPreparacion && pedido.finPreparacion && (
              <span style={{ 
                color: '#10b981',
                fontWeight: '700',
                fontSize: '0.875rem'
              }}>
                - {calcularTiempoPreparacion(pedido.inicioPreparacion, pedido.finPreparacion)}
              </span>
            )}
          </div>
        </div>

        {pedido.usuarioCreador && pedido.usuarioCreador.nombre && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: '0.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <span style={{ color: '#6b7280' }}>Mesero:</span>
            <span style={{ fontWeight: '600', color: '#667eea' }}>
              {pedido.usuarioCreador.nombre}
            </span>
          </div>
        )}
      </div>

      {/* Información de cancelación */}
      {pedido.cancelado && (
        <div style={{
          background: '#fee2e2',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '2px solid #fca5a5'
        }}>
          <div style={{ 
            fontSize: '0.875rem', 
            color: '#991b1b', 
            fontWeight: '700', 
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <XCircle size={16} />
            PEDIDO CANCELADO
          </div>
          <div style={{ fontSize: '0.75rem', color: '#7f1d1d', lineHeight: '1.5' }}>
            <div><strong>Motivo:</strong> {pedido.motivoCancelacion || 'No especificado'}</div>
            <div><strong>Por:</strong> {getNombreUsuario(pedido.usuarioCancelacion)}</div>
            <div><strong>Fecha:</strong> {new Date(pedido.fechaCancelacion).toLocaleString('es-PE', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit', 
              minute: '2-digit' 
            })}</div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="pedido-items">
        {pedido.items.map((item, index) => (
          <div key={index} className="pedido-item">
            <span className="pedido-item-nombre">{item.nombre}</span>
            <span className="pedido-item-cantidad">x{item.cantidad}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="pedido-total">
        <span>Total:</span>
        <span>S/ {pedido.total.toFixed(2)}</span>
      </div>

      {/* Estados */}
      {!pedido.cancelado && (
        <div className="pedido-estados">
          <span className={`estado-badge ${pedido.estado}`}>
            {getEstadoLabel(pedido.estado)}
          </span>
          <span className={`estado-badge pago-${pedido.estadoPago}`}>
            {pedido.estadoPago === 'pagado' ? 'Pagado' : pedido.estadoPago === 'credito' ? 'A Crédito' : 'Por Cobrar'}
          </span>
        </div>
      )}

      {/* Acciones */}
      {!pedido.cancelado && (
        <div className="pedido-acciones">
          {pedido.estado === 'pendiente' && (
            <ProtectedAction permisos={['cocina.actualizar']}>
              <button 
                className="btn-accion btn-cocina"
                onClick={() => onUpdateEstado(pedido._id, 'en_preparacion')}
              >
                Iniciar Preparación
              </button>
            </ProtectedAction>
          )}

          {pedido.estado === 'en_preparacion' && (
            <ProtectedAction permisos={['cocina.actualizar']}>
              <button 
                className="btn-accion btn-completar"
                onClick={() => onUpdateEstado(pedido._id, 'completado')}
              >
                <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Marcar Listo
              </button>
            </ProtectedAction>
          )}

          {pedido.estado === 'completado' && pedido.estadoPago === 'pendiente' && (
            <ProtectedAction permisos={['caja.cobrar']}>
              <button 
                className="btn-accion btn-cobrar"
                onClick={() => {
                  const tienePermisoCredito = authAPI.hasPermission('creditos.crear');
                  const opciones = tienePermisoCredito 
                    ? 'Método de pago:\n1. Efectivo\n2. Yape\n3. Transferencia\n4. Crédito'
                    : 'Método de pago:\n1. Efectivo\n2. Yape\n3. Transferencia';
                  
                  const metodo = prompt(opciones, '1');
                  const metodos = { 
                    '1': 'efectivo', 
                    '2': 'yape', 
                    '3': 'transferencia',
                    '4': 'credito'
                  };
                  
                  if (metodos[metodo]) {
                    if (metodo === '4' && !tienePermisoCredito) {
                      alert('No tienes permiso para autorizar créditos');
                      return;
                    }
                    
                    if (metodo === '4') {
                      if (window.confirm(`¿Marcar pedido de "${pedido.cliente}" como crédito?`)) {
                        onRegistrarPago(pedido._id, metodos[metodo]);
                      }
                    } else {
                      onRegistrarPago(pedido._id, metodos[metodo]);
                    }
                  }
                }}
              >
                <DollarSign size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Cobrar
              </button>
            </ProtectedAction>
          )}

          {pedido.estado === 'pendiente' && pedido.estadoPago === 'pendiente' && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginTop: '0.5rem' 
            }}>
              <button 
                className="btn-accion btn-editar"
                onClick={() => onEditar(pedido)}
                style={{
                  background: '#dbeafe',
                  color: '#1e40af',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <Edit2 size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Editar
              </button>

              <button 
                className="btn-accion btn-cancelar"
                onClick={() => onCancelar(pedido._id)}
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <XCircle size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};