import React from 'react';
import { UtensilsCrossed, Plus } from 'lucide-react';
import ProtectedAction from '../../ProtectedAction';
import { getCategoriaLabel } from '../utils/platosHelpers';

export const PlatosHeader = ({ categoriaActual, estadisticas, onNuevoPlato }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
          {getCategoriaLabel(categoriaActual)}
        </h2>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
          {estadisticas.total} platos · {estadisticas.disponibles} disponibles
        </p>
      </div>

      <ProtectedAction permisos={['platos.crear']}>
        <button
          onClick={onNuevoPlato}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white', border: 'none', padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Plus size={20} /> Nuevo Plato
        </button>
      </ProtectedAction>
    </div>
  );
};