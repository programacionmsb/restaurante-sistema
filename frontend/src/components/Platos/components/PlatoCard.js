import React from 'react';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import ProtectedAction from '../../ProtectedAction';
import { getCategoriaLabel } from '../utils/platosHelpers';

export const PlatoCard = ({ plato, onEditar, onEliminar, onToggleDisponibilidad }) => {
  return (
    <div className={`plato-card ${plato.tipo}`}>
      <span className={`plato-badge-tipo ${plato.tipo}`}>
        {getCategoriaLabel(plato.tipo).split(' ')[1] || getCategoriaLabel(plato.tipo)}
      </span>

      <div className="plato-nombre">{plato.nombre}</div>

      <ProtectedAction
        permisos={['platos.ver_precios']}
        fallback={<div style={{ height: '2.5rem' }}></div>}
      >
        <div className="plato-precio">S/ {plato.precio.toFixed(2)}</div>
      </ProtectedAction>

      <div className={`plato-disponibilidad ${plato.disponible ? 'disponible' : 'no-disponible'}`}>
        {plato.disponible ? (
          <><Eye size={16} /><span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Disponible</span></>
        ) : (
          <><EyeOff size={16} /><span style={{ fontWeight: '600', fontSize: '0.875rem' }}>No Disponible</span></>
        )}
      </div>

      <div className="plato-acciones">
        <ProtectedAction permisos={['platos.editar']}>
          <button
            onClick={() => onToggleDisponibilidad(plato)}
            style={{
              flex: 1, background: plato.disponible ? '#fee2e2' : '#d1fae5',
              color: plato.disponible ? '#991b1b' : '#065f46',
              border: 'none', padding: '0.5rem', borderRadius: '0.5rem',
              cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem',
            }}
          >
            {plato.disponible ? 'Ocultar' : 'Mostrar'}
          </button>
        </ProtectedAction>

        <ProtectedAction permisos={['platos.editar']}>
          <button
            onClick={() => onEditar(plato)}
            style={{ background: '#dbeafe', color: '#1e40af', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
            title="Editar"
          >
            <Edit2 size={16} />
          </button>
        </ProtectedAction>

        <ProtectedAction permisos={['platos.eliminar']}>
          <button
            onClick={() => onEliminar(plato._id, plato.nombre)}
            style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </ProtectedAction>
      </div>
    </div>
  );
};