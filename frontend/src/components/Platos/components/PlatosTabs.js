import React from 'react';
import { CATEGORIAS, getCategoriaLabel } from '../utils/platosHelpers';

export const PlatosTabs = ({ categoriaActual, onCambiarCategoria }) => {
  return (
    <div className="platos-tabs">
      {CATEGORIAS.map(tipo => (
        <button
          key={tipo}
          className={`plato-tab ${categoriaActual === tipo ? 'active' : ''}`}
          onClick={() => onCambiarCategoria(tipo)}
        >
          {getCategoriaLabel(tipo)}
        </button>
      ))}
    </div>
  );
};