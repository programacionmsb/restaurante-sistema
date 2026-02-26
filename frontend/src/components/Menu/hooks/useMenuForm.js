import { useState } from 'react';
import { menuAPI } from '../../../services/apiMenu';
import { getPlatoInfo } from '../utils/menuHelpers';

const FORM_VACIO = {
  nombreMenu: '',
  descripcionMenu: '',
  precioCompleto: 0,
  fechaSeleccionada: '',
  categorias: [],
};

// Obtiene fecha local como string YYYY-MM-DD sin desfase UTC
const getFechaLocalStr = (fecha = new Date()) => {
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Obtiene fecha UTC como string YYYY-MM-DD (para leer fechas del backend)
const getFechaUTCStr = (fecha) => {
  const d = new Date(fecha);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

export const useMenuForm = (onGuardado) => {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [esNuevoMenu, setEsNuevoMenu] = useState(false);
  const [menuSeleccionado, setMenuSeleccionado] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState(null);

  const setField = (campo, valor) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  // ========== ABRIR / CERRAR ==========

  const crearNuevoMenu = (fecha = null) => {
    setEsNuevoMenu(true);
    setMenuSeleccionado(null);
    setForm({
      ...FORM_VACIO,
      // Si viene fecha del grid (Date object), usar local; si no, fecha de hoy local
      fechaSeleccionada: fecha ? getFechaLocalStr(fecha) : getFechaLocalStr(),
    });
    setModoEdicion(true);
  };

  const editarMenu = (menu) => {
    setEsNuevoMenu(false);
    setMenuSeleccionado(menu);
    const categoriasParaEdicion = menu.categorias.map(cat => ({
      nombre: cat.nombre,
      platos: cat.platos.map(plato => ({
        platoId: typeof plato.platoId === 'string' ? plato.platoId : plato.platoId._id,
      })),
    }));
    setForm({
      nombreMenu: menu.nombre,
      descripcionMenu: menu.descripcion || '',
      precioCompleto: menu.precioCompleto || 0,
      // Leer fecha del backend en UTC para no perder un día
      fechaSeleccionada: getFechaUTCStr(menu.fecha),
      categorias: categoriasParaEdicion,
    });
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setEsNuevoMenu(false);
    setMenuSeleccionado(null);
    setForm(FORM_VACIO);
    setError(null);
  };

  // ========== CATEGORÍAS ==========

  const agregarCategoria = (nombreCategoria) => {
    if (form.categorias.find(c => c.nombre === nombreCategoria)) {
      alert('Esta categoría ya está agregada');
      return;
    }
    setField('categorias', [...form.categorias, { nombre: nombreCategoria, platos: [] }]);
  };

  const eliminarCategoria = (nombreCategoria) => {
    if (window.confirm(`¿Eliminar la categoría "${nombreCategoria}"?`)) {
      setField('categorias', form.categorias.filter(c => c.nombre !== nombreCategoria));
    }
  };

  const agregarPlatoACategoria = (nombreCategoria, platoId) => {
    setField('categorias', form.categorias.map(cat => {
      if (cat.nombre !== nombreCategoria) return cat;
      if (cat.platos.some(p => p.platoId === platoId)) return cat;
      return { ...cat, platos: [...cat.platos, { platoId }] };
    }));
  };

  const eliminarPlatoDeCategoria = (nombreCategoria, platoId) => {
    setField('categorias', form.categorias.map(cat => {
      if (cat.nombre !== nombreCategoria) return cat;
      return { ...cat, platos: cat.platos.filter(p => p.platoId !== platoId) };
    }));
  };

  // ========== GUARDAR ==========

  const handleGuardarMenu = async () => {
    const { nombreMenu, fechaSeleccionada, categorias, descripcionMenu, precioCompleto } = form;

    if (!nombreMenu.trim()) return alert('El nombre del menú es obligatorio');
    if (!fechaSeleccionada) return alert('Selecciona una fecha para el menú');
    if (categorias.length === 0) return alert('Agrega al menos una categoría al menú');
    const totalPlatos = categorias.reduce((sum, cat) => sum + cat.platos.length, 0);
    if (totalPlatos === 0) return alert('Agrega al menos un plato al menú');

    try {
      const menuData = {
        fecha: fechaSeleccionada,
        nombre: nombreMenu.trim(),
        descripcion: descripcionMenu,
        categorias,
        precioCompleto: parseFloat(precioCompleto) || 0,
      };

      if (esNuevoMenu) {
        await menuAPI.create(menuData);
      } else {
        await menuAPI.update(menuSeleccionado._id, menuData);
      }

      cancelarEdicion();
      onGuardado?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPlatosMenu = form.categorias.reduce((sum, cat) => sum + cat.platos.length, 0);

  return {
    modoEdicion,
    esNuevoMenu,
    form,
    setField,
    error,
    totalPlatosMenu,
    crearNuevoMenu,
    editarMenu,
    cancelarEdicion,
    agregarCategoria,
    eliminarCategoria,
    agregarPlatoACategoria,
    eliminarPlatoDeCategoria,
    handleGuardarMenu,
  };
};