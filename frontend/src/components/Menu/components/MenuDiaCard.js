import React from 'react';
import { Plus, Eye, EyeOff, Edit2, Trash2, FileDown, FileSpreadsheet, Copy } from 'lucide-react';
import ProtectedAction from '../../ProtectedAction';

export const MenuDiaCard = ({
  dia,
  menus,
  onCrear,
  onEditar,
  onEliminar,
  onToggle,
  onClonar,
  onExportarPDF,
  onExportarExcel,
}) => {
  const esHoy = dia.toDateString() === new Date().toDateString();
  const fechaStr = `${dia.getFullYear()}-${String(dia.getMonth()+1).padStart(2,'0')}-${String(dia.getDate()).padStart(2,'0')}`;
  const menusActivos = menus.filter(m => m.activo);

  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div style={{
      background: esHoy ? '#fef3c7' : 'white',
      border: esHoy ? '2px solid #fbbf24' : '2px solid #e5e7eb',
      borderRadius: '1rem',
      padding: '1rem',
      minHeight: '200px',
    }}>
      {/* Header del día */}
      <div style={{ marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>
          {dias[dia.getDay()]}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
          {dia.getDate()}
        </div>
      </div>

      {/* Botones exportar por día */}
      {menusActivos.length > 0 && (
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
          <button
            onClick={() => onExportarPDF(dia)}
            style={{
              flex: 1, padding: '0.5rem', background: '#dc2626', color: 'white',
              border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: '600',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
            }}
            title="Descargar PDF"
          >
            <FileDown size={12} /> PDF
          </button>
          <button
            onClick={() => onExportarExcel(dia)}
            style={{
              flex: 1, padding: '0.5rem', background: '#16a34a', color: 'white',
              border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: '600',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
            }}
            title="Descargar Excel"
          >
            <FileSpreadsheet size={12} /> Excel
          </button>
        </div>
      )}

      {/* Menús del día */}
      {menus.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menus.map(menu => (
            <div
              key={menu._id}
              style={{
                background: menu.activo ? '#fdf2f8' : '#f3f4f6',
                border: `1px solid ${menu.activo ? '#ec4899' : '#d1d5db'}`,
                borderRadius: '0.5rem',
                padding: '0.75rem',
                opacity: menu.activo ? 1 : 0.6,
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: menu.activo ? '#831843' : '#6b7280', marginBottom: '0.5rem' }}>
                {menu.nombre}
                {!menu.activo && <span style={{ fontSize: '0.625rem', marginLeft: '0.25rem' }}>(Oculto)</span>}
              </div>

              {menu.precioCompleto > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600', marginBottom: '0.5rem' }}>
                  S/ {menu.precioCompleto.toFixed(2)}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <ProtectedAction permisos={['menu.editar']}>
                  <button
                    onClick={() => onToggle(menu._id)}
                    style={{
                      flex: 1, padding: '0.25rem',
                      background: menu.activo ? '#fef3c7' : '#d1fae5',
                      color: menu.activo ? '#92400e' : '#065f46',
                      border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.625rem',
                    }}
                    title={menu.activo ? 'Ocultar' : 'Mostrar'}
                  >
                    {menu.activo ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </ProtectedAction>

                <ProtectedAction permisos={['menu.editar']}>
                  <button
                    onClick={() => onEditar(menu)}
                    style={{
                      flex: 1, padding: '0.25rem', background: '#dbeafe', color: '#1e40af',
                      border: 'none', borderRadius: '0.25rem', cursor: 'pointer',
                    }}
                    title="Editar"
                  >
                    <Edit2 size={12} />
                  </button>
                </ProtectedAction>

                <ProtectedAction permisos={['menu.crear']}>
                  <button
                    onClick={() => onClonar(menu)}
                    style={{
                      flex: 1, padding: '0.25rem', background: '#e0e7ff', color: '#4338ca',
                      border: 'none', borderRadius: '0.25rem', cursor: 'pointer',
                    }}
                    title="Clonar"
                  >
                    <Copy size={12} />
                  </button>
                </ProtectedAction>

                <ProtectedAction permisos={['menu.eliminar']}>
                  <button
                    onClick={() => onEliminar(menu._id)}
                    style={{
                      flex: 1, padding: '0.25rem', background: '#fee2e2', color: '#991b1b',
                      border: 'none', borderRadius: '0.25rem', cursor: 'pointer',
                    }}
                    title="Eliminar"
                  >
                    <Trash2 size={12} />
                  </button>
                </ProtectedAction>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af', fontSize: '0.75rem' }}>
          Sin menús
        </div>
      )}

      {/* Botón agregar */}
      <ProtectedAction permisos={['menu.crear']}>
        <button
          onClick={() => onCrear(fechaStr)}
          style={{
            width: '100%', padding: '0.5rem', background: '#f3f4f6', color: '#6b7280',
            border: '2px dashed #d1d5db', borderRadius: '0.5rem', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: '600', marginTop: '0.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
          }}
        >
          <Plus size={14} /> Agregar
        </button>
      </ProtectedAction>
    </div>
  );
};