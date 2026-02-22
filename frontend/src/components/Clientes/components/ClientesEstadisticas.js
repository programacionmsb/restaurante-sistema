import React from 'react';
import { Users, Mail, Phone } from 'lucide-react';

export const ClientesEstadisticas = ({ stats }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '2px solid #667eea'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Users size={20} color="#667eea" />
          <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
            Total Clientes
          </span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
          {stats.totalClientes}
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '2px solid #10b981'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Mail size={20} color="#10b981" />
          <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
            Con Email
          </span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
          {stats.clientesConEmail}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
          {stats.porcentajeConEmail}% del total
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '2px solid #f59e0b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Phone size={20} color="#f59e0b" />
          <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
            Sin Email
          </span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
          {stats.clientesSinEmail}
        </div>
      </div>
    </div>
  );
};