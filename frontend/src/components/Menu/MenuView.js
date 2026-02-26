import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { useMenu } from './hooks/useMenu';
import { useMenuForm } from './hooks/useMenuForm';
import { useMenuExport } from './hooks/useMenuExport';
import { MenuFormulario } from './components/MenuFormulario';
import { MenuSemanaGrid } from './components/MenuSemanaGrid';
import { formatFecha, getFinSemana } from './utils/menuHelpers';
import { menuAPI } from '../../services/apiMenu';
import './menu.css';

export default function MenuView() {
  const {
    semanaActual,
    menus,
    platosDisponibles,
    loading,
    error,
    cargarMenus,
    eliminarMenu,
    toggleMenuActivo,
    cambiarSemana,
    irSemanaActual,
  } = useMenu();

  const {
    modoEdicion,
    esNuevoMenu,
    form,
    setField,
    totalPlatosMenu,
    crearNuevoMenu,
    editarMenu,
    cancelarEdicion,
    agregarCategoria,
    eliminarCategoria,
    agregarPlatoACategoria,
    eliminarPlatoDeCategoria,
    handleGuardarMenu,
  } = useMenuForm(cargarMenus);

  const {
    exportarDiaPDF,
    exportarDiaExcel,
    exportarSemanaPDF,
    exportarSemanaExcel,
    diasSemanales,
    inicioSemanaStr,
    finSemanaStr,
  } = useMenuExport(semanaActual, menus);

  // ========== CLONAR MENÚ ==========
  const clonarMenu = async (menu) => {
    try {
      // Obtener menús del mismo día
      const menusMismoDia = menus.filter(m => {
        const fechaMenu = new Date(m.fecha).toISOString().split('T')[0];
        const fechaOriginal = new Date(menu.fecha).toISOString().split('T')[0];
        return fechaMenu === fechaOriginal;
      });

      // Nombre base sin prefijo COPIA N -
      const nombreBase = menu.nombre.replace(/^COPIA \d+ - /, '');

      // Contar copias existentes del mismo nombre base
      const copias = menusMismoDia.filter(m =>
        m.nombre.match(/^COPIA \d+ - /) && m.nombre.replace(/^COPIA \d+ - /, '') === nombreBase
      ).length;

      const nombreClon = `COPIA ${copias + 1} - ${nombreBase}`;

      const fechaStr = new Date(menu.fecha).toISOString().split('T')[0];

      const menuData = {
        fecha: fechaStr,
        nombre: nombreClon,
        descripcion: menu.descripcion || '',
        precioCompleto: menu.precioCompleto || 0,
        categorias: menu.categorias.map(cat => ({
          nombre: cat.nombre,
          platos: cat.platos.map(p => ({
            platoId: typeof p.platoId === 'string' ? p.platoId : p.platoId._id,
          }))
        }))
      };

      await menuAPI.create(menuData);
      cargarMenus();
    } catch (error) {
      alert('Error al clonar menú: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Calendar size={48} className="loading-icon" />
          <h2>Cargando menús...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {/* Header */}
      <header className="menu-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={32} color="#ec4899" />
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>Menú del Día</h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Gestión de Menús Semanales</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="menu-main">
        <div className="menu-card">
          {error && (
            <div className="creditos-alert creditos-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {modoEdicion ? (
            <MenuFormulario
              esNuevoMenu={esNuevoMenu}
              form={form}
              setField={setField}
              platosDisponibles={platosDisponibles}
              totalPlatosMenu={totalPlatosMenu}
              onGuardar={handleGuardarMenu}
              onCancelar={cancelarEdicion}
              onAgregarCategoria={agregarCategoria}
              onEliminarCategoria={eliminarCategoria}
              onAgregarPlato={agregarPlatoACategoria}
              onEliminarPlato={eliminarPlatoDeCategoria}
            />
          ) : (
            <MenuSemanaGrid
              diasSemanales={diasSemanales}
              menus={menus}
              inicioSemanaStr={inicioSemanaStr}
              finSemanaStr={finSemanaStr}
              onCambiarSemana={cambiarSemana}
              onIrSemanaActual={irSemanaActual}
              onExportarSemanaPDF={exportarSemanaPDF}
              onExportarSemanaExcel={exportarSemanaExcel}
              onExportarDiaPDF={exportarDiaPDF}
              onExportarDiaExcel={exportarDiaExcel}
              onCrearMenu={crearNuevoMenu}
              onEditarMenu={editarMenu}
              onEliminarMenu={eliminarMenu}
              onToggleMenu={toggleMenuActivo}
              onClonarMenu={clonarMenu}
            />
          )}
        </div>
      </main>
    </div>
  );
}