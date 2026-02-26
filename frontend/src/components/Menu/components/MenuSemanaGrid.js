import React from 'react';
import { ChevronLeft, ChevronRight, FileDown, FileSpreadsheet } from 'lucide-react';
import { MenuDiaCard } from './MenuDiaCard';
import { getMenusPorFecha } from '../utils/menuHelpers';

export const MenuSemanaGrid = ({
  diasSemanales,
  menus,
  inicioSemanaStr,
  finSemanaStr,
  onCambiarSemana,
  onIrSemanaActual,
  onExportarSemanaPDF,
  onExportarSemanaExcel,
  onExportarDiaPDF,
  onExportarDiaExcel,
  onCrearMenu,
  onEditarMenu,
  onEliminarMenu,
  onToggleMenu,
  onClonarMenu,
}) => {
  return (
    <>
      {/* Navegación semanal */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '2rem', padding: '1rem', background: '#f9fafb',
        borderRadius: '0.75rem', flexWrap: 'wrap', gap: '1rem',
      }}>
        <button
          onClick={() => onCambiarSemana(-1)}
          style={{ padding: '0.75rem', background: 'white', border: '2px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Semana anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
            {inicioSemanaStr} - {finSemanaStr}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onIrSemanaActual}
              style={{ padding: '0.5rem 1rem', background: '#ec4899', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
            >
              Semana Actual
            </button>
            <button
              onClick={onExportarSemanaPDF}
              style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FileDown size={16} /> Exportar Semana PDF
            </button>
            <button
              onClick={onExportarSemanaExcel}
              style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FileSpreadsheet size={16} /> Exportar Semana Excel
            </button>
          </div>
        </div>

        <button
          onClick={() => onCambiarSemana(1)}
          style={{ padding: '0.75rem', background: 'white', border: '2px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Semana siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Grid de 7 días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
        {diasSemanales.map((dia, index) => (
          <MenuDiaCard
            key={`dia-${index}`}
            dia={dia}
            menus={getMenusPorFecha(menus, dia)}
            onCrear={onCrearMenu}
            onEditar={onEditarMenu}
            onEliminar={onEliminarMenu}
            onToggle={onToggleMenu}
            onClonar={onClonarMenu}
            onExportarPDF={onExportarDiaPDF}
            onExportarExcel={onExportarDiaExcel}
          />
        ))}
      </div>
    </>
  );
};