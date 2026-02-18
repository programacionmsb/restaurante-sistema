import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Edit2, Trash2, UserCheck, UserX, Search } from 'lucide-react';
import { usuariosAPI } from '../../services/apiUsuarios';
import UsuarioModal from './UsuarioModal';
import ProtectedAction from '../ProtectedAction';
import './usuarios.css';

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await usuariosAPI.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (usuario = null) => {
    setEditingUsuario(usuario);
    setModalOpen(true);
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el usuario "${nombre}"?`)) return;

    try {
      await usuariosAPI.delete(id);
      cargarUsuarios();
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleActivo = async (usuario) => {
    try {
      await usuariosAPI.update(usuario._id, { activo: !usuario.activo });
      cargarUsuarios();
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredUsuarios = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.rol?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (nombre) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Nunca';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <UsersIcon size={48} className="loading-icon" />
          <h2>Cargando usuarios...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-container">
      {/* Header */}
      <header className="usuarios-header">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <UsersIcon size={32} color="#10b981" />
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>RestaurantePRO</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Gestión de Usuarios</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="usuarios-main">
        <div className="usuarios-card">
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
              Usuarios del Sistema ({usuarios.length})
            </h2>
            
            {/* PROTEGER BOTÓN NUEVO USUARIO */}
            <ProtectedAction permisos={['usuarios.crear']}>
              <button
                onClick={() => openModal()}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Plus size={20} />
                Nuevo Usuario
              </button>
            </ProtectedAction>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} 
            />
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#374151', fontWeight: '600' }}>Usuario</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#374151', fontWeight: '600' }}>Rol</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#374151', fontWeight: '600' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#374151', fontWeight: '600' }}>Último Acceso</th>
                  <th style={{ textAlign: 'right', padding: '1rem', color: '#374151', fontWeight: '600' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((usuario) => (
                  <tr 
                    key={usuario._id}
                    style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div 
                          className="usuario-avatar"
                          style={{ backgroundColor: usuario.rol?.color || '#6b7280' }}
                        >
                          {getInitials(usuario.nombre)}
                        </div>
                        <div>
                          <div className="usuario-nombre">{usuario.nombre}</div>
                          <div className="usuario-email">@{usuario.usuario}</div>
                          {usuario.email && (
                            <div className="usuario-email">{usuario.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span 
                        className="usuario-rol-badge"
                        style={{ 
                          backgroundColor: usuario.rol?.color + '20',
                          color: usuario.rol?.color || '#6b7280'
                        }}
                      >
                        {usuario.rol?.nombre || 'Sin rol'}
                      </span>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span className={`usuario-estado ${usuario.activo ? 'activo' : 'inactivo'}`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span className="usuario-ultimo-acceso">
                        {formatFecha(usuario.ultimoAcceso)}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {/* PROTEGER BOTÓN ACTIVAR/DESACTIVAR */}
                        <ProtectedAction permisos={['usuarios.editar']}>
                          <button
                            onClick={() => toggleActivo(usuario)}
                            style={{
                              background: usuario.activo ? '#fee2e2' : '#d1fae5',
                              color: usuario.activo ? '#991b1b' : '#065f46',
                              border: 'none',
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              cursor: 'pointer'
                            }}
                            title={usuario.activo ? 'Desactivar' : 'Activar'}
                          >
                            {usuario.activo ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                        </ProtectedAction>

                        {/* PROTEGER BOTÓN EDITAR */}
                        <ProtectedAction permisos={['usuarios.editar']}>
                          <button
                            onClick={() => openModal(usuario)}
                            style={{
                              background: '#dbeafe',
                              color: '#1e40af',
                              border: 'none',
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              cursor: 'pointer'
                            }}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                        </ProtectedAction>

                        {/* PROTEGER BOTÓN ELIMINAR */}
                        <ProtectedAction permisos={['usuarios.eliminar']}>
                          <button
                            onClick={() => handleDelete(usuario._id, usuario.nombre)}
                            style={{
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              cursor: 'pointer'
                            }}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </ProtectedAction>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsuarios.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                No se encontraron usuarios
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <UsuarioModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          usuario={editingUsuario}
          onSave={cargarUsuarios}
        />
      )}
    </div>
  );
}