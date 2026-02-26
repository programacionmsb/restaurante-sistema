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

      const inicioStr = inicio.toISOString().split('T')[0];
      const finStr = fin.toISOString().split('T')[0];

      console.log('=== MENU DEBUG ===');
      console.log('semanaActual:', semanaActual);
      console.log('inicio objeto:', inicio.toString());
      console.log('fin objeto:', fin.toString());
      console.log('inicioStr enviado al API:', inicioStr);
      console.log('finStr enviado al API:', finStr);

      const menusData = await menuAPI.getPorRango(inicioStr, finStr);

      console.log('menus recibidos:', menusData.length);
      menusData.forEach(m => {
        console.log(`  menu: ${m.nombre} | fecha raw: ${m.fecha} | fecha UTC: ${new Date(m.fecha).toISOString().split('T')[0]}`);
      });

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
      setPlatosDisponibles({
        entrada: entradas.filter(p => p.disponible),
        plato:   platos.filter(p => p.disponible),
        bebida:  bebidas.filter(p => p.disponible),
        postre:  postres.filter(p => p.disponible),
        otros:   otros.filter(p => p.disponible),
      });
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