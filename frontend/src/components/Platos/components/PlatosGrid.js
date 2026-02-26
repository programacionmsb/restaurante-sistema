import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { PlatoCard } from './PlatoCard';

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'disponibles', label: '✅ Disponibles' },
  { value: 'no_disponibles', label: '🚫 No disponibles' },
];

export const PlatosGrid = ({ platos, onEditar, onEliminar, onToggleDisponibilidad }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('todos');

  const platosFiltrados = platos
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .filter(p => {
      if (filtroDisponibilidad === 'disponibles') return p.disponible;
      if (filtroDisponibilidad === 'no_disponibles') return !p.disponible;
      return true;
    });

  if (platos.length === 0) {
    return (
      <div className="platos-vacio">
        <div className="platos-vacio-icono">🍽️</div>
        <h3>No hay platos en esta categoría</h3>
        <p>Agrega el primer plato usando el botón "Nuevo Plato"</p>
      </div>
    );
  }

  return (
    <>
      {/* Barra de filtros */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>

        {/* Buscador por categoría */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '350px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en esta categoría..."
            style={{
              width: '100%', padding: '0.6rem 2.5rem 0.6rem 2.25rem',
              border: '2px solid #e5e7eb', borderRadius: '0.5rem',
              fontSize: '0.875rem', outline: 'none',
            }}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filtro disponibilidad */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltroDisponibilidad(f.value)}
              style={{
                padding: '0.5rem 0.875rem',
                border: '2px solid',
                borderColor: filtroDisponibilidad === f.value ? '#8b5cf6' : '#e5e7eb',
                borderRadius: '9999px',
                background: filtroDisponibilidad === f.value ? '#8b5cf6' : 'white',
                color: filtroDisponibilidad === f.value ? 'white' : '#6b7280',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Contador */}
        <span style={{ fontSize: '0.8rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
          {platosFiltrados.length} de {platos.length}
        </span>
      </div>

      {/* Grid o mensaje vacío */}
      {platosFiltrados.length === 0 ? (
        <div className="platos-vacio">
          <div className="platos-vacio-icono">🔍</div>
          <h3>Sin resultados</h3>
          <p>
            {busqueda ? `No hay platos con "${busqueda}"` : `No hay platos ${filtroDisponibilidad === 'disponibles' ? 'disponibles' : 'no disponibles'} en esta categoría`}
          </p>
        </div>
      ) : (
        <div className="platos-grid">
          {platosFiltrados.map(plato => (
            <PlatoCard
              key={plato._id}
              plato={plato}
              onEditar={onEditar}
              onEliminar={onEliminar}
              onToggleDisponibilidad={onToggleDisponibilidad}
            />
          ))}
        </div>
      )}
    </>
  );
};