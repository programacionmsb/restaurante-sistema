import { useState, useEffect } from 'react';
import { menuAPI } from '../../../services/apiMenu';
import { platosAPI } from '../../../services/apiPlatos';
import { getInicioSemana, getFinSemana } from '../utils/menuHelpers';

export const useMenu = () => {
  const [semanaActual, setSemanaActual] = useState(getInicioSemana(new Date()));
  const [menus, setMenus] = useState([]);
  const [platosDisponibles, setPlatosDisponibles] = useState({
    entrada: [],
    plato: [],
    bebida: [],
    postre: [],
    otros: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const inicio = new Date(semanaActual);
      const fin = getFinSemana(inicio);
      const menusData = await menuAPI.getPorRango(
        inicio.toISOString().split('T')[0],
        fin.toISOString().split('T')[0]
      );
      setMenus(menusData);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar menús de la semana');
    } finally {
      setLoading(false);
    }
  };

  const cargarPlatos = async () => {
    try {
      const [entradas, platos, bebidas, postres, otros] = await Promise.all([
        platosAPI.getByTipo('entrada'),
        platosAPI.getByTipo('plato'),
        platosAPI.getByTipo('bebida'),
        platosAPI.getByTipo('postre'),
        platosAPI.getByTipo('otros'),
      ]);
      setPlatosDisponibles({ entrada: entradas, plato: platos, bebida: bebidas, postre: postres, otros });
    } catch (err) {
      console.error('Error cargando platos:', err);
    }
  };

  const eliminarMenu = async (menuId) => {
    if (!window.confirm('¿Estás seguro de eliminar este menú?')) return;
    try {
      await menuAPI.delete(menuId);
      cargarMenus();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleMenuActivo = async (menuId) => {
    try {
      await menuAPI.toggle(menuId);
      cargarMenus();
    } catch (err) {
      setError(err.message);
    }
  };

  const cambiarSemana = (direccion) => {
    const nuevaFecha = new Date(semanaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + direccion * 7);
    setSemanaActual(getInicioSemana(nuevaFecha));
  };

  const irSemanaActual = () => {
    setSemanaActual(getInicioSemana(new Date()));
  };

  useEffect(() => {
    cargarMenus();
    cargarPlatos();
  }, [semanaActual]);

  return {
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
  };
};
