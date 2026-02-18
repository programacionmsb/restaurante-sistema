import React, { useState, useEffect } from 'react';
import { usuariosAPI } from '../../services/apiUsuarios';
import { rolesAPI } from '../../services/apiRoles';
import { X, Eye, EyeOff } from 'lucide-react';
import './usuarios.css';

export default function UsuarioModal({ isOpen, onClose, usuario, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    password: '',
    email: '',
    rol: '',
    pin: '',
    activo: true
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    cargarRoles();
  }, []);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        usuario: usuario.usuario,
        password: '', // No mostramos la contraseña
        email: usuario.email || '',
        rol: usuario.rol?._id || '',
        pin: usuario.pin || '',
        activo: usuario.activo
      });
    } else {
      setFormData({
        nombre: '',
        usuario: '',
        password: '',
        email: '',
        rol: '',
        pin: '',
        activo: true
      });
    }
  }, [usuario]);

  const cargarRoles = async () => {
    try {
      const data = await rolesAPI.getAll();
      setRoles(data.filter(r => r.activo)); // Solo roles activos
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (!formData.usuario.trim()) {
      alert('El usuario es obligatorio');
      return;
    }

    if (!usuario && !formData.password) {
      alert('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    if (!formData.rol) {
      alert('Debe seleccionar un rol');
      return;
    }

    // Validar PIN si se proporciona
    if (formData.pin && !/^\d{4}$/.test(formData.pin)) {
      alert('El PIN debe ser de 4 dígitos');
      return;
    }

    try {
      const dataToSend = { ...formData };
      
      // Si estamos editando y no se cambió la contraseña, no enviarla
      if (usuario && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (usuario) {
        await usuariosAPI.update(usuario._id, dataToSend);
      } else {
        await usuariosAPI.create(dataToSend);
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
        style={{ maxWidth: '600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
            {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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

        {/* Formulario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Nombre completo */}
          <div className="form-group">
            <label className="form-label">Nombre Completo *</label>
            <input
              type="text"
              className="form-input"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez García"
              autoFocus
            />
          </div>

          {/* Usuario (username) */}
          <div className="form-group">
            <label className="form-label">Usuario (Login) *</label>
            <input
              type="text"
              className="form-input"
              value={formData.usuario}
              onChange={(e) => setFormData({ ...formData, usuario: e.target.value.toLowerCase() })}
              placeholder="Ej: juan.perez"
              disabled={!!usuario} // No se puede cambiar el usuario una vez creado
            />
            {usuario && (
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                El nombre de usuario no se puede modificar
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label className="form-label">
              Contraseña {!usuario && '*'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={usuario ? 'Dejar en blanco para mantener la actual' : 'Contraseña segura'}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@ejemplo.com"
            />
          </div>

          {/* Rol */}
          <div className="form-group">
            <label className="form-label">Rol *</label>
            {loading ? (
              <p style={{ color: '#6b7280' }}>Cargando roles...</p>
            ) : (
              <select
                className="form-input"
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                style={{ cursor: 'pointer' }}
              >
                <option value="">-- Seleccionar Rol --</option>
                {roles.map(rol => (
                  <option key={rol._id} value={rol._id}>
                    {rol.nombre} {rol.esPredefinido ? '(Predefinido)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* PIN (opcional) */}
          <div className="form-group">
            <label className="form-label">PIN de 4 dígitos (Opcional)</label>
            <input
              type="text"
              className="form-input"
              value={formData.pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                setFormData({ ...formData, pin: value });
              }}
              placeholder="1234"
              maxLength={4}
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              PIN rápido para acceso desde dispositivos móviles
            </p>
          </div>

          {/* Estado */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>Usuario Activo</span>
            </label>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginLeft: '1.75rem' }}>
              Los usuarios inactivos no pueden iniciar sesión
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="modal-buttons" style={{ marginTop: '2rem' }}>
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-guardar" onClick={handleSave}>
            {usuario ? 'Actualizar' : 'Crear'} Usuario
          </button>
        </div>
      </div>
    </div>
  );
}