import React, { useState, useEffect } from 'react';
import { platosAPI } from '../../services/apiPlatos';
import { X } from 'lucide-react';
import './platos.css';

export default function PlatoModal({ isOpen, onClose, plato, onSave, categoriaInicial }) {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    tipo: categoriaInicial || 'entrada',
    disponible: true
  });

  useEffect(() => {
    if (plato) {
      setFormData({
        nombre: plato.nombre,
        precio: plato.precio.toString(),
        tipo: plato.tipo,
        disponible: plato.disponible
      });
    } else {
      setFormData({
        nombre: '',
        precio: '',
        tipo: categoriaInicial || 'entrada',
        disponible: true
      });
    }
  }, [plato, categoriaInicial]);

  const handleSave = async () => {
    if (!formData.nombre.trim()) { alert('El nombre es obligatorio'); return; }
    if (!formData.precio || parseFloat(formData.precio) <= 0) { alert('Ingrese un precio válido'); return; }

    try {
      const dataToSend = { ...formData, precio: parseFloat(formData.precio) };
      if (plato) {
        await platosAPI.update(plato._id, dataToSend);
      } else {
        await platosAPI.create(dataToSend);
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
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
            {plato ? 'Editar Plato' : 'Nuevo Plato'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#6b7280' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Categoría *</label>
            <div className="plato-tipo-selector">
              {[
                { tipo: 'entrada', label: '🥗 Entradas' },
                { tipo: 'plato', label: '🍖 Platos' },
                { tipo: 'bebida', label: '🥤 Bebidas' },
                { tipo: 'postre', label: '🍰 Postres' },
                { tipo: 'menu', label: '📋 Menú' },
                { tipo: 'otros', label: '📦 Otros' },
              ].map(({ tipo, label }) => (
                <button
                  key={tipo}
                  type="button"
                  className={`plato-tipo-option ${tipo} ${formData.tipo === tipo ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, tipo })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Plato *</label>
            <input
              type="text"
              className="form-input"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Ceviche Mixto"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Precio (S/) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.disponible}
                onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>Disponible para la venta</span>
            </label>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginLeft: '1.75rem' }}>
              Los platos no disponibles no aparecerán en el menú de pedidos
            </p>
          </div>
        </div>

        <div className="modal-buttons" style={{ marginTop: '2rem' }}>
          <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button className="btn-guardar" onClick={handleSave}>
            {plato ? 'Actualizar' : 'Crear'} Plato
          </button>
        </div>
      </div>
    </div>
  );
}