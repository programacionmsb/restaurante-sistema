import React, { useState, useEffect } from 'react';
import { Calendar, Users } from 'lucide-react';
import { authAPI } from '../../../services/apiAuth';

export const PedidosFiltros = ({ 
  filtroFecha, 
  onCambiarFiltroFecha, 
  fechaPersonalizada, 
  onCambiarFechaPersonalizada,
  filtroUsuario,
  onCambiarFiltroUsuario 
}) => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await fetch('https://restaurante-backend-a6o9.onrender.com/api/usuarios');
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const puedeVerFiltroUsuarios = () => {
    const user = authAPI.getCurrentUser();
    if (!user || !user.rol || !user.rol.permisos) return false;
    return user.rol.permisos.includes('pedidos.ver_todos');
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem', 
      marginBottom: '1rem',
      flexWrap: 'wrap',
      padding: '1rem',
      background: '#f9fafb',
      borderRadius: '0.75rem'
    }}>
      <button
        onClick={() => onCambiarFiltroFecha('hoy')}
        style={{
          padding: '0.5rem 1rem',
          background: filtroFecha === 'hoy' ? '#f59e0b' : 'white',
          color: filtroFecha === 'hoy' ? 'white' : '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        Hoy
      </button>
      <button
        onClick={() => onCambiarFiltroFecha('ayer')}
        style={{
          padding: '0.5rem 1rem',
          background: filtroFecha === 'ayer' ? '#f59e0b' : 'white',
          color: filtroFecha === 'ayer' ? 'white' : '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        Ayer
      </button>
      <button
        onClick={() => onCambiarFiltroFecha('ultimos7')}
        style={{
          padding: '0.5rem 1rem',
          background: filtroFecha === 'ultimos7' ? '#f59e0b' : 'white',
          color: filtroFecha === 'ultimos7' ? 'white' : '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        Últimos 7 días
      </button>
      <button
        onClick={() => onCambiarFiltroFecha('ultimos30')}
        style={{
          padding: '0.5rem 1rem',
          background: filtroFecha === 'ultimos30' ? '#f59e0b' : 'white',
          color: filtroFecha === 'ultimos30' ? 'white' : '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        Últimos 30 días
      </button>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Calendar size={16} style={{ color: '#6b7280' }} />
        <input
          type="date"
          value={fechaPersonalizada}
          onChange={(e) => {
            onCambiarFechaPersonalizada(e.target.value);
            onCambiarFiltroFecha('personalizado');
          }}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        />
      </div>

      {puedeVerFiltroUsuarios() && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
          <Users size={16} style={{ color: '#6b7280' }} />
          <select
            value={filtroUsuario}
            onChange={(e) => onCambiarFiltroUsuario(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              background: 'white',
              fontWeight: '600'
            }}
          >
            <option value="todos">Todos los usuarios</option>
            {usuarios.map(usuario => (
              <option key={usuario._id} value={usuario._id}>
                {usuario.nombre}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};