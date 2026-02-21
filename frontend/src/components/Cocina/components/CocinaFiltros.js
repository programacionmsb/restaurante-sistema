import React from 'react';
import { Search, Users } from 'lucide-react';

export const CocinaFiltros = ({ 
  meseros, 
  filtroMesero, 
  onCambiarFiltroMesero, 
  busquedaCliente, 
  onCambiarBusquedaCliente 
}) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      {/* Filtro por Mesero */}
      <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Users size={20} style={{ color: '#6b7280' }} />
        <select
          value={filtroMesero}
          onChange={(e) => onCambiarFiltroMesero(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            background: 'white'
          }}
        >
          <option value="todos">👥 Todos los meseros</option>
          {meseros.map(mesero => (
            <option key={mesero._id} value={mesero._id}>
              {mesero.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Búsqueda por Cliente */}
      <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Search size={20} style={{ color: '#6b7280' }} />
        <input
          type="text"
          placeholder="Buscar por cliente..."
          value={busquedaCliente}
          onChange={(e) => onCambiarBusquedaCliente(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.95rem'
          }}
        />
      </div>
    </div>
  );
};