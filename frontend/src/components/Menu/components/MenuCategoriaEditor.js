import React from 'react';
import { Trash2 } from 'lucide-react';
import { getCategoriaLabel, getTipoPorCategoria, getPlatoInfo, CATEGORIAS_DISPONIBLES } from '../utils/menuHelpers';

export const MenuCategoriaEditor = ({
  categorias,
  platosDisponibles,
  onAgregarCategoria,
  onEliminarCategoria,
  onAgregarPlato,
  onEliminarPlato,
}) => {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Botones para agregar categorías */}
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#1f2937' }}>
        Categorías del Menú ({categorias.length})
      </h3>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {CATEGORIAS_DISPONIBLES.map(cat => {
          const yaAgregada = categorias.some(c => c.nombre === cat);
          return (
            <button
              key={cat}
              onClick={() => onAgregarCategoria(cat)}
              disabled={yaAgregada}
              style={{
                padding: '0.5rem 1rem',
                background: yaAgregada ? '#d1d5db' : '#ec4899',
                color: yaAgregada ? '#6b7280' : 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: yaAgregada ? 'not-allowed' : 'pointer',
              }}
            >
              {getCategoriaLabel(cat)}
            </button>
          );
        })}
      </div>

      {/* Lista de categorías */}
      {categorias.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
          <h3>Agrega categorías al menú</h3>
          <p>Selecciona las categorías arriba para empezar a construir el menú</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {categorias.map((categoria, index) => {
            const tipoCat = getTipoPorCategoria(categoria.nombre);
            const platosDisponiblesCat = platosDisponibles[tipoCat] || [];
            const platosAgregados = categoria.platos
              .map(p => getPlatoInfo(platosDisponibles, p.platoId))
              .filter(Boolean);

            return (
              <div
                key={`${categoria.nombre}-${index}`}
                style={{
                  background: 'white',
                  border: '2px solid #ec4899',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                }}
              >
                {/* Header categoría */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.125rem', color: '#1f2937' }}>
                    {getCategoriaLabel(categoria.nombre)}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      ({platosAgregados.length} platos)
                    </span>
                  </h4>
                  <button
                    onClick={() => onEliminarCategoria(categoria.nombre)}
                    style={{
                      padding: '0.5rem',
                      background: '#fee2e2',
                      color: '#991b1b',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Platos agregados */}
                {platosAgregados.length > 0 && (
                  <div style={{ marginBottom: '1rem', display: 'grid', gap: '0.5rem' }}>
                    {platosAgregados.map(plato => (
                      <div
                        key={plato._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          background: '#f0fdf4',
                          borderRadius: '0.5rem',
                          border: '1px solid #86efac',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937' }}>{plato.nombre}</div>
                          <div style={{ fontSize: '0.875rem', color: '#10b981' }}>S/ {plato.precio.toFixed(2)}</div>
                        </div>
                        <button
                          onClick={() => onEliminarPlato(categoria.nombre, plato._id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selector de platos */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Agregar platos
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        onAgregarPlato(categoria.nombre, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      background: 'white',
                    }}
                  >
                    <option value="">-- Selecciona un plato --</option>
                    {platosDisponiblesCat
                      .filter(p => !categoria.platos.some(cp => cp.platoId === p._id))
                      .map(plato => (
                        <option key={plato._id} value={plato._id}>
                          {plato.nombre} - S/ {plato.precio.toFixed(2)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
