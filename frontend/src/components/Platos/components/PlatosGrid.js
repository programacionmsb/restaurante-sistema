import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { PlatoCard } from './PlatoCard';

export const PlatosGrid = ({ platos, onEditar, onEliminar, onToggleDisponibilidad }) => {
  const [busqueda, setBusqueda] = useState('');

  const platosFiltrados = platos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

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
      {/* Buscador por categoría */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
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

      {platosFiltrados.length === 0 ? (
        <div className="platos-vacio">
          <div className="platos-vacio-icono">🔍</div>
          <h3>Sin resultados para "{busqueda}"</h3>
          <p>Intenta con otro término</p>
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