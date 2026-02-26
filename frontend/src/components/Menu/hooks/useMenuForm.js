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
      fechaSeleccionada: fecha || new Date().toISOString().split('T')[0],
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
      fechaSeleccionada: (() => { const d = new Date(menu.fecha); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; })(),
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
