import { useState } from 'react';
import { menuAPI } from '../../../services/apiMenu';

const FORM_VACIO = {
  nombreMenu: '',
  descripcionMenu: '',
  precios: [],
  fechaSeleccionada: '',
  categorias: [],
};

const getFechaLocalStr = (fecha = new Date()) => {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const getFechaUTCStr = (fecha) => {
  const d = new Date(fecha);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
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
      fechaSeleccionada: fecha ? getFechaLocalStr(new Date(fecha + 'T12:00:00')) : getFechaLocalStr(),
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
      precios: menu.precios && menu.precios.length > 0
        ? menu.precios.map(p => ({ nombre: p.nombre, precio: p.precio }))
        : menu.precioCompleto > 0
          ? [{ nombre: 'General', precio: menu.precioCompleto }]
          : [],
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
    const { nombreMenu, fechaSeleccionada, categorias, descripcionMenu, precios } = form;

    if (!nombreMenu.trim()) return alert('El nombre del menú es obligatorio');
    if (!fechaSeleccionada) return alert('Selecciona una fecha para el menú');
    if (categorias.length === 0) return alert('Agrega al menos una categoría al menú');
    const totalPlatos = categorias.reduce((sum, cat) => sum + cat.platos.length, 0);
    if (totalPlatos === 0) return alert('Agrega al menos un plato al menú');

    // Validar precios — filtrar vacíos
    const preciosValidos = precios.filter(p => p.nombre && p.nombre.trim() && p.precio !== '' && !isNaN(p.precio));

    // precioCompleto = primer precio para compatibilidad con pedidos
    const precioCompleto = preciosValidos.length > 0 ? parseFloat(preciosValidos[0].precio) : 0;

    try {
      const menuData = {
        fecha: fechaSeleccionada,
        nombre: nombreMenu.trim(),
        descripcion: descripcionMenu,
        categorias,
        precios: preciosValidos.map(p => ({ nombre: p.nombre.trim(), precio: parseFloat(p.precio) })),
        precioCompleto,
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