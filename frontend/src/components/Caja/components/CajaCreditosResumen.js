import React from 'react';
import { CreditCard, AlertTriangle, Clock } from 'lucide-react';

export const CajaCreditosResumen = ({ reporteCreditos }) => {
  if (!reporteCreditos || reporteCreditos.resumen.totalDeuda === 0) {
    return null;
  }

  const { resumen, porAntiguedad } = reporteCreditos;

  return (
    <div className="caja-section">
      <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CreditCard size={24} color="#ef4444" />
        Resumen de Créditos
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {/* Total Créditos */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: '2px solid #ef4444',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Total en Crédito
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
            S/ {resumen.totalDeuda.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            {resumen.cantidadClientes} cliente{resumen.cantidadClientes !== 1 ? 's' : ''}
          </div>
        </div>

        {/* 0-7 días */}
        {porAntiguedad.hasta7dias > 0 && (
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '2px solid #10b981',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={14} />
              0-7 días (Reciente)
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
              S/ {porAntiguedad.hasta7dias.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {((porAntiguedad.hasta7dias / resumen.totalDeuda) * 100).toFixed(1)}% del total
            </div>
          </div>
        )}

        {/* 8-30 días */}
        {porAntiguedad.de8a30dias > 0 && (
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '2px solid #f59e0b',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertTriangle size={14} />
              8-30 días
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
              S/ {porAntiguedad.de8a30dias.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {((porAntiguedad.de8a30dias / resumen.totalDeuda) * 100).toFixed(1)}% del total
            </div>
          </div>
        )}

        {/* +30 días */}
        {porAntiguedad.mas30dias > 0 && (
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '2px solid #ef4444',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertTriangle size={14} />
              +30 días (Antiguo)
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
              S/ {porAntiguedad.mas30dias.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {((porAntiguedad.mas30dias / resumen.totalDeuda) * 100).toFixed(1)}% del total
            </div>
          </div>
        )}
      </div>

      <div style={{
        background: '#fef3c7',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #f59e0b',
        fontSize: '0.875rem',
        color: '#92400e'
      }}>
        💡 <strong>Nota:</strong> Los créditos pueden gestionarse desde la sección "Créditos" del menú principal.
      </div>
    </div>
  );
};