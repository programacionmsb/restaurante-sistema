import React from 'react';
import './clientes.css';

export default function ClienteModal({ 
  isOpen, 
  onClose, 
  cliente, 
  formData, 
  setFormData, 
  onSave 
}) {
  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.nombre || !formData.telefono) {
      alert('Complete nombre y teléfono');
      return;
    }
    onSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">
          {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h3>

        <div className="form-group">
          <label className="form-label">Nombre *</label>
          <input
            type="text"
            className="form-input"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('telefono-input').focus();
              }
            }}
            placeholder="Nombre completo"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Teléfono *</label>
          <input
            id="telefono-input"
            type="tel"
            className="form-input"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('email-input').focus();
              }
            }}
            placeholder="987654321"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            id="email-input"
            type="email"
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="cliente@email.com"
          />
        </div>

        <div className="modal-buttons">
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-guardar" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}