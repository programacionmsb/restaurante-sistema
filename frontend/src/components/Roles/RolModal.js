import React, { useState, useEffect } from 'react';
import { rolesAPI } from '../../services/apiRoles';
import { X } from 'lucide-react';
import './roles.css';

const COLORES_DISPONIBLES = [
  '#667eea', // Púrpura
  '#10b981', // Verde
  '#f59e0b', // Naranja
  '#ef4444', // Rojo
  '#3b82f6', // Azul
  '#8b5cf6', // Violeta
  '#ec4899', // Rosa
  '#06b6d4', // Cyan
];

// Agrupar permisos por categoría
const agruparPermisos = (permisosDisponibles) => {
  const grupos = {
    'CLIENTES': [],
    'PEDIDOS': [],
    'COCINA': [],
    'CAJA': [],
    'MENÚ': [],
    'PLATOS': [],
    'USUARIOS': [],
    'ROLES': [],
    'REPORTES': [],
    'CONFIGURACIÓN': []
  };

  Object.entries(permisosDisponibles).forEach(([key, descripcion]) => {
    const categoria = key.split('.')[0].toUpperCase();
    
    if (categoria === 'CLIENTES') grupos.CLIENTES.push({ key, descripcion });
    else if (categoria === 'PEDIDOS') grupos.PEDIDOS.push({ key, descripcion });
    else if (categoria === 'COCINA') grupos.COCINA.push({ key, descripcion });
    else if (categoria === 'CAJA') grupos.CAJA.push({ key, descripcion });
    else if (categoria === 'MENU') grupos.MENÚ.push({ key, descripcion });
    else if (categoria === 'PLATOS') grupos.PLATOS.push({ key, descripcion });
    else if (categoria === 'USUARIOS') grupos.USUARIOS.push({ key, descripcion });
    else if (categoria === 'ROLES') grupos.ROLES.push({ key, descripcion });
    else if (categoria === 'REPORTES') grupos.REPORTES.push({ key, descripcion });
    else if (categoria === 'CONFIG') grupos.CONFIGURACIÓN.push({ key, descripcion });
  });

  return grupos;
};

export default function RolModal({ isOpen, onClose, rol, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: [],
    color: '#667eea'
  });
  const [permisosDisponibles, setPermisosDisponibles] = useState({});
  const [permisosAgrupados, setPermisosAgrupados] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPermisos();
  }, []);

  useEffect(() => {
    if (rol) {
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion || '',
        permisos: rol.permisos || [],
        color: rol.color || '#667eea'
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        permisos: [],
        color: '#667eea'
      });
    }
  }, [rol]);

  const cargarPermisos = async () => {
    try {
      const permisos = await rolesAPI.getPermisosDisponibles();
      setPermisosDisponibles(permisos);
      setPermisosAgrupados(agruparPermisos(permisos));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermisoChange = (permisoKey) => {
    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permisoKey)
        ? prev.permisos.filter(p => p !== permisoKey)
        : [...prev.permisos, permisoKey]
    }));
  };

  const handleToggleCategoria = (categoria) => {
    const permisosCategoria = permisosAgrupados[categoria].map(p => p.key);
    const todosMarcados = permisosCategoria.every(p => formData.permisos.includes(p));

    setFormData(prev => ({
      ...prev,
      permisos: todosMarcados
        ? prev.permisos.filter(p => !permisosCategoria.includes(p))
        : [...new Set([...prev.permisos, ...permisosCategoria])]
    }));
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      alert('El nombre del rol es obligatorio');
      return;
    }

    if (formData.permisos.length === 0) {
      alert('Debe seleccionar al menos un permiso');
      return;
    }

    try {
      if (rol) {
        await rolesAPI.update(rol._id, formData);
      } else {
        await rolesAPI.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
            {rol ? 'Editar Rol' : 'Nuevo Rol'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#6b7280'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Información básica */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Nombre del Rol *</label>
            <input
              type="text"
              className="form-input"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Supervisor de Turno"
              disabled={rol?.esPredefinido}
            />
            {rol?.esPredefinido && (
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                No se puede modificar el nombre de roles predefinidos
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-input"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe las responsabilidades de este rol..."
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Color de Identificación</label>
            <div className="color-picker">
              {COLORES_DISPONIBLES.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Permisos */}
        <div>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#1f2937' }}>
            Permisos ({formData.permisos.length} seleccionados)
          </h4>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Cargando permisos...
            </div>
          ) : (
            <div className="permisos-grid">
              {Object.entries(permisosAgrupados).map(([categoria, permisos]) => {
                if (permisos.length === 0) return null;

                const todosMarcados = permisos.every(p => formData.permisos.includes(p.key));
                const algunosMarcados = permisos.some(p => formData.permisos.includes(p.key));

                return (
                  <div key={categoria} className="permiso-categoria">
                    <div className="permiso-categoria-header">
                      <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '700', color: '#1f2937' }}>
                        {categoria}
                      </h5>
                      <button
                        type="button"
                        onClick={() => handleToggleCategoria(categoria)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          background: todosMarcados ? '#fee2e2' : '#dbeafe',
                          color: todosMarcados ? '#991b1b' : '#1e40af',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {todosMarcados ? 'Desmarcar' : 'Marcar'} todos
                      </button>
                    </div>

                    <div>
                      {permisos.map(({ key, descripcion }) => (
                        <div key={key} className="permiso-checkbox">
                          <input
                            type="checkbox"
                            id={key}
                            checked={formData.permisos.includes(key)}
                            onChange={() => handlePermisoChange(key)}
                          />
                          <label htmlFor={key}>{descripcion}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="modal-buttons" style={{ marginTop: '2rem' }}>
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-guardar" onClick={handleSave}>
            {rol ? 'Actualizar' : 'Crear'} Rol
          </button>
        </div>
      </div>
    </div>
  );
}