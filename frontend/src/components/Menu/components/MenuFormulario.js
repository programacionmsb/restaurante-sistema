import React from 'react';
import { Save, X } from 'lucide-react';
import { MenuCategoriaEditor } from './MenuCategoriaEditor';

export const MenuFormulario = ({
  esNuevoMenu,
  form,
  setField,
  platosDisponibles,
  totalPlatosMenu,
  onGuardar,
  onCancelar,
  onAgregarCategoria,
  onEliminarCategoria,
  onAgregarPlato,
  onEliminarPlato,
}) => {
  const { nombreMenu, descripcionMenu, precioCompleto, fechaSeleccionada, categorias } = form;

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
          {esNuevoMenu ? 'Crear Nuevo Menú' : 'Editar Menú'}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onCancelar}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <X size={20} /> Cancelar
          </button>
          <button
            onClick={onGuardar}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Save size={20} /> Guardar Menú
          </button>
        </div>
      </div>

      {/* Información del menú */}
      <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#1f2937' }}>Información del Menú</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
              Nombre del Menú *
            </label>
            <input
              type="text"
              value={nombreMenu}
              onChange={(e) => setField('nombreMenu', e.target.value)}
              placeholder="Ej: Menú Ejecutivo, Menú Vegetariano, Menú Kids..."
              style={{ width: '100%', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
              Fecha *
            </label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setField('fechaSeleccionada', e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
              Precio Completo
            </label>
            <input
              type="number"
              value={precioCompleto}
              onChange={(e) => setField('precioCompleto', e.target.value)}
              placeholder="0.00"
              step="0.01"
              style={{ width: '100%', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
            Descripción
          </label>
          <textarea
            value={descripcionMenu}
            onChange={(e) => setField('descripcionMenu', e.target.value)}
            placeholder="Descripción del menú..."
            rows={2}
            style={{ width: '100%', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Editor de categorías */}
      <MenuCategoriaEditor
        categorias={categorias}
        platosDisponibles={platosDisponibles}
        onAgregarCategoria={onAgregarCategoria}
        onEliminarCategoria={onEliminarCategoria}
        onAgregarPlato={onAgregarPlato}
        onEliminarPlato={onEliminarPlato}
      />

      {/* Resumen */}
      {totalPlatosMenu > 0 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#fef3c7',
          borderRadius: '0.75rem',
          border: '2px solid #fbbf24',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>Total de platos en el menú</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>{totalPlatosMenu} platos</div>
            </div>
            {precioCompleto > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>Precio menú completo</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>S/ {parseFloat(precioCompleto).toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
