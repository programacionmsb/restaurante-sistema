import React from 'react';
import { CheckCircle, Clock, DollarSign, Smartphone, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

export const CajaResumen = ({ stats, reporteCreditos }) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {/* Total Cobrado */}
      <div className="caja-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
        <div className="caja-card-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <CheckCircle size={32} color="white" />
        </div>
        <div className="caja-card-content">
          <div className="caja-card-label">Total Cobrado</div>
          <div className="caja-card-value">S/ {stats.totalCobrado.toFixed(2)}</div>
          <div className="caja-card-sublabel">{stats.pedidosPagados.length} pedidos pagados</div>
        </div>
      </div>

      {/* Por Cobrar */}
      <div className="caja-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
        <div className="caja-card-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <Clock size={32} color="white" />
        </div>
        <div className="caja-card-content">
          <div className="caja-card-label">Por Cobrar</div>
          <div className="caja-card-value">S/ {stats.totalPorCobrar.toFixed(2)}</div>
          <div className="caja-card-sublabel">{stats.pedidosPorCobrar.length} pedidos pendientes</div>
        </div>
      </div>

      {/* Créditos */}
      {reporteCreditos && reporteCreditos.resumen.totalDeuda > 0 && (
        <div className="caja-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          <div className="caja-card-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <AlertCircle size={32} color="white" />
          </div>
          <div className="caja-card-content">
            <div className="caja-card-label">Créditos Pendientes</div>
            <div className="caja-card-value">S/ {reporteCreditos.resumen.totalDeuda.toFixed(2)}</div>
            <div className="caja-card-sublabel">{reporteCreditos.resumen.cantidadClientes} cliente{reporteCreditos.resumen.cantidadClientes !== 1 ? 's' : ''}</div>
          </div>
        </div>
      )}

      {/* Efectivo */}
      <div className="caja-card" style={{ background: 'white', border: '2px solid #10b981' }}>
        <div className="caja-card-icon" style={{ background: '#d1fae5' }}>
          <DollarSign size={32} color="#059669" />
        </div>
        <div className="caja-card-content" style={{ color: '#1f2937' }}>
          <div className="caja-card-label" style={{ color: '#6b7280' }}>Efectivo</div>
          <div className="caja-card-value" style={{ color: '#059669' }}>S/ {stats.porEfectivo.toFixed(2)}</div>
          <div className="caja-card-sublabel" style={{ color: '#6b7280' }}>
            {stats.pedidosPagados.filter(p => p.metodoPago === 'efectivo').length} pagos
          </div>
        </div>
      </div>

      {/* Yape */}
      <div className="caja-card" style={{ background: 'white', border: '2px solid #3b82f6' }}>
        <div className="caja-card-icon" style={{ background: '#dbeafe' }}>
          <Smartphone size={32} color="#2563eb" />
        </div>
        <div className="caja-card-content" style={{ color: '#1f2937' }}>
          <div className="caja-card-label" style={{ color: '#6b7280' }}>Yape</div>
          <div className="caja-card-value" style={{ color: '#2563eb' }}>S/ {stats.porYape.toFixed(2)}</div>
          <div className="caja-card-sublabel" style={{ color: '#6b7280' }}>
            {stats.pedidosPagados.filter(p => p.metodoPago === 'yape').length} pagos
          </div>
        </div>
      </div>

      {/* Transferencia */}
      <div className="caja-card" style={{ background: 'white', border: '2px solid #8b5cf6' }}>
        <div className="caja-card-icon" style={{ background: '#ede9fe' }}>
          <CreditCard size={32} color="#7c3aed" />
        </div>
        <div className="caja-card-content" style={{ color: '#1f2937' }}>
          <div className="caja-card-label" style={{ color: '#6b7280' }}>Transferencia</div>
          <div className="caja-card-value" style={{ color: '#7c3aed' }}>S/ {stats.porTransferencia.toFixed(2)}</div>
          <div className="caja-card-sublabel" style={{ color: '#6b7280' }}>
            {stats.pedidosPagados.filter(p => p.metodoPago === 'transferencia').length} pagos
          </div>
        </div>
      </div>

      {/* Descuentos */}
      {stats.totalDescuentos > 0 && (
        <div className="caja-card" style={{ background: 'white', border: '2px solid #ef4444' }}>
          <div className="caja-card-icon" style={{ background: '#fee2e2' }}>
            <TrendingUp size={32} color="#dc2626" />
          </div>
          <div className="caja-card-content" style={{ color: '#1f2937' }}>
            <div className="caja-card-label" style={{ color: '#6b7280' }}>Descuentos</div>
            <div className="caja-card-value" style={{ color: '#dc2626' }}>S/ {stats.totalDescuentos.toFixed(2)}</div>
            <div className="caja-card-sublabel" style={{ color: '#6b7280' }}>Cortesías y promociones</div>
          </div>
        </div>
      )}
    </div>
  );
};