import React from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
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
  const { nombreMenu, descripcionMenu, precios = [], fechaSeleccionada, categorias } = form;

  const agregarPrecio = () => {
    setField('precios', [...precios, { nombre: '', precio: '' }]);
  };

  const actualizarPrecio = (index, campo, valor) => {
    const nuevosPrecios = precios.map((p, i) =>
      i === index ? { ...p, [campo]: valor } : p
    );
    setField('precios', nuevosPrecios);
  };

  const eliminarPrecio = (index) => {
    setField('precios', precios.filter((_, i) => i !== index));
  };

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
              padding: '0.75rem 1.5rem', background: '#e5e7eb', color: '#374151',
              border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <X size={20} /> Cancelar
          </button>
          <button
            onClick={onGuardar}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <Save size={20} /> Guardar Menú
          </button>
        </div>
      </div>

      {/* Información del menú */}
      <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#1f2937' }}>Información del Menú</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
              Nombre del Menú *
            </label>
            <input
              type="text"
              value={nombreMenu}
              onChange={(e) => setField('nombreMenu', e.target.value)}
              placeholder="Ej: Menú Ejecutivo, Menú Vegetariano..."
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
        </div>

        <div style={{ marginBottom: '1rem' }}>
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

        {/* ===== TABLA DE PRECIOS ===== */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '600' }}>
              Precios por Tipo
            </label>
            <button
              onClick={agregarPrecio}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.4rem 0.75rem', background: '#ec4899', color: 'white',
                border: 'none', borderRadius: '0.375rem', fontSize: '0.8rem',
                fontWeight: '600', cursor: 'pointer'
              }}
            >
              <Plus size={14} /> Agregar Precio
            </button>
          </div>

          {precios.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '1rem', border: '2px dashed #d1d5db',
              borderRadius: '0.5rem', color: '#9ca3af', fontSize: '0.875rem'
            }}>
              Sin precios definidos — clic en "Agregar Precio"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', paddingBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Nombre</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Precio (S/)</span>
                <span></span>
              </div>
              {precios.map((p, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={p.nombre}
                    onChange={(e) => actualizarPrecio(index, 'nombre', e.target.value)}
                    placeholder="Ej: EMSUNIR, Mesa, Llevar..."
                    style={{
                      padding: '0.6rem 0.75rem', border: '2px solid #e5e7eb',
                      borderRadius: '0.375rem', fontSize: '0.875rem', width: '100%'
                    }}
                  />
                  <input
                    type="number"
                    value={p.precio}
                    onChange={(e) => actualizarPrecio(index, 'precio', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    style={{
                      padding: '0.6rem 0.75rem', border: '2px solid #e5e7eb',
                      borderRadius: '0.375rem', fontSize: '0.875rem', width: '100%'
                    }}
                  />
                  <button
                    onClick={() => eliminarPrecio(index)}
                    style={{
                      padding: '0.5rem', background: '#fee2e2', color: '#991b1b',
                      border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
          marginTop: '1.5rem', padding: '1rem', background: '#fef3c7',
          borderRadius: '0.75rem', border: '2px solid #fbbf24',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>Total de platos en el menú</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>{totalPlatosMenu} platos</div>
            </div>
            {precios.length > 0 && (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {precios.filter(p => p.nombre && p.precio).map((p, i) => (
                  <div key={i} style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '600' }}>{p.nombre}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#92400e' }}>S/ {parseFloat(p.precio).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};