import { useState, useEffect } from 'react';
import { menuAPI } from '../../../services/apiMenu';
import { platosAPI } from '../../../services/apiPlatos';
import { getInicioSemana, getFinSemana, getDiasSemanales, getMenusPorFecha } from '../utils/menuHelpers';

const toLocalDateStr = (fecha) => {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export const useMenu = () => {
  const [semanaActual, setSemanaActual] = useState(getInicioSemana(new Date()));
  const [menus, setMenus] = useState([]);
  const [platosDisponibles, setPlatosDisponibles] = useState({
    entrada: [], plato: [], bebida: [], postre: [], otros: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const inicio = new Date(semanaActual);
      const fin = getFinSemana(inicio);

      const inicioStr = toLocalDateStr(inicio);
      const finStr = toLocalDateStr(fin);

      console.log('=== MENU DEBUG cargarMenus ===');
      console.log('semanaActual raw:', semanaActual);
      console.log('inicio.toString():', inicio.toString());
      console.log('inicio local date:', inicioStr);
      console.log('fin local date:', finStr);

      const menusData = await menuAPI.getPorRango(inicioStr, finStr);

      console.log('=== MENUS RECIBIDOS DEL BACKEND ===');
      menusData.forEach(m => {
        const fechaRaw = m.fecha;
        const fechaObj = new Date(fechaRaw);
        console.log(`  nombre: "${m.nombre}"`);
        console.log(`    fecha raw del backend: ${fechaRaw}`);
        console.log(`    fecha UTC str: ${fechaObj.toISOString().split('T')[0]}`);
        console.log(`    fecha LOCAL str: ${toLocalDateStr(fechaObj)}`);
        console.log(`    getUTCDate: ${fechaObj.getUTCDate()} | getDate (local): ${fechaObj.getDate()}`);
      });

      // Log del grid de días
      console.log('=== GRID DE DIAS SEMANALES ===');
      const dias = getDiasSemanales(semanaActual);
      dias.forEach(dia => {
        const menusDelDia = getMenusPorFecha(menusData, dia);
        console.log(`  dia: ${dia.toString()} | local: ${toLocalDateStr(dia)} | menus: ${menusDelDia.map(m => m.nombre).join(', ') || 'ninguno'}`);
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
    semanaActual, menus, platosDisponibles, loading, error,
    cargarMenus, eliminarMenu, toggleMenuActivo, cambiarSemana, irSemanaActual,
  };
};