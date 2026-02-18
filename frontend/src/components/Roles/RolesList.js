import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { rolesAPI } from '../../services/apiRoles';
import RolModal from './RolModal';
import ProtectedAction from '../ProtectedAction';
import './roles.css';

export default function RolesList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [expandedRol, setExpandedRol] = useState(null);

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    setLoading(true);
    try {
      const data = await rolesAPI.getAll();
      setRoles(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (rol = null) => {
    setEditingRol(rol);
    setModalOpen(true);
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el rol "${nombre}"?`)) return;

    try {
      await rolesAPI.delete(id);
      cargarRoles();
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleExpand = (rolId) => {
    setExpandedRol(expandedRol === rolId ? null : rolId);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Shield size={48} className="loading-icon" />
          <h2>Cargando roles...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="roles-container">
      {/* Header */}
      <header className="roles-header">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={32} color="#667eea" />
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>RestaurantePRO</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Gestión de Roles y Permisos</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="roles-main">
        <div className="roles-card">
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
              Roles del Sistema ({roles.length})
            </h2>
            
            {/* PROTEGER BOTÓN NUEVO ROL */}
            <ProtectedAction permisos={['roles.crear']}>
              <button
                onClick={() => openModal()}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                Nuevo Rol
              </button>
            </ProtectedAction>
          </div>

          {/* Lista de Roles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {roles.map((rol) => (
              <div 
                key={rol._id} 
                className={`rol-item ${rol.esPredefinido ? 'predefinido' : 'personalizado'}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  {/* Información del rol */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div 
                        className="rol-color-indicator" 
                        style={{ backgroundColor: rol.color }}
                      />
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>
                        {rol.nombre}
                      </h3>
                      <span className={`rol-badge ${rol.esPredefinido ? 'predefinido' : 'personalizado'}`}>
                        {rol.esPredefinido ? 'Predefinido' : 'Personalizado'}
                      </span>
                    </div>
                    
                    {rol.descripcion && (
                      <p style={{ margin: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                        {rol.descripcion}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        <Users size={16} />
                        <span>{rol.cantidadUsuarios || 0} usuario(s)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        <Shield size={16} />
                        <span>{rol.permisos.length} permiso(s)</span>
                      </div>
                    </div>

                    {/* Permisos expandibles */}
                    {expandedRol === rol._id && (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                          PERMISOS ASIGNADOS:
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
                          {rol.permisos.map((permiso) => (
                            <div 
                              key={permiso}
                              style={{ 
                                padding: '0.5rem 0.75rem', 
                                background: 'white', 
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                color: '#4b5563',
                                border: '1px solid #e5e7eb'
                              }}
                            >
                              • {permiso}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      onClick={() => toggleExpand(rol._id)}
                      style={{
                        background: '#f3f4f6',
                        color: '#4b5563',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Ver permisos"
                    >
                      {expandedRol === rol._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {/* PROTEGER BOTÓN EDITAR */}
                    <ProtectedAction permisos={['roles.editar']}>
                      <button
                        onClick={() => openModal(rol)}
                        style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          cursor: 'pointer'
                        }}
                        title="Editar rol"
                      >
                        <Edit2 size={16} />
                      </button>
                    </ProtectedAction>

                    {/* PROTEGER BOTÓN ELIMINAR */}
                    {!rol.esPredefinido && (
                      <ProtectedAction permisos={['roles.eliminar']}>
                        <button
                          onClick={() => handleDelete(rol._id, rol.nombre)}
                          style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                          }}
                          title="Eliminar rol"
                        >
                          <Trash2 size={16} />
                        </button>
                      </ProtectedAction>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {roles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              No hay roles creados
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <RolModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          rol={editingRol}
          onSave={cargarRoles}
        />
      )}
    </div>
  );
}