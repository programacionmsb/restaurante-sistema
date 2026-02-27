import { useState, useEffect } from 'react';
import { pedidosAPI } from '../../../services/apiPedidos';

// Retorna fecha local como string YYYY-MM-DD (sin conversión UTC)
const toLocalDateStr = (fecha = new Date()) => {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const usePedidos = (filtroFecha, fechaPersonalizada) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPedidosPorFecha = async () => {
    setLoading(true);
    try {
      let data;

      if (filtroFecha === 'hoy') {
        data = await pedidosAPI.getHoy();
      } else if (filtroFecha === 'ayer') {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        data = await pedidosAPI.getPorRango(toLocalDateStr(ayer), toLocalDateStr(ayer));
      } else if (filtroFecha === 'personalizado' && fechaPersonalizada) {
        data = await pedidosAPI.getPorRango(fechaPersonalizada, fechaPersonalizada);
      } else {
        const hoy = new Date();
        let fechaInicio;

        if (filtroFecha === 'ultimos7') {
          fechaInicio = new Date(hoy);
          fechaInicio.setDate(hoy.getDate() - 6);
        } else if (filtroFecha === 'ultimos30') {
          fechaInicio = new Date(hoy);
          fechaInicio.setDate(hoy.getDate() - 29);
        }

        data = await pedidosAPI.getPorRango(
          toLocalDateStr(fechaInicio),
          toLocalDateStr(hoy)
        );
      }
      
      setPedidos(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidosPorFecha();
  }, [filtroFecha, fechaPersonalizada]);

  return {
    pedidos,
    loading,
    cargarPedidosPorFecha
  };
};