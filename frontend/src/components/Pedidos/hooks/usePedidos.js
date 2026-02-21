import { useState, useEffect } from 'react';
import { pedidosAPI } from '../../../services/apiPedidos';

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
        const ayerStr = ayer.toISOString().split('T')[0];
        data = await pedidosAPI.getPorRango(ayerStr, ayerStr);
      } else if (filtroFecha === 'personalizado' && fechaPersonalizada) {
        data = await pedidosAPI.getPorRango(fechaPersonalizada, fechaPersonalizada);
      } else {
        const hoy = new Date();
        let fechaInicio;
        let fechaFin = new Date(hoy);
        
        if (filtroFecha === 'ultimos7') {
          fechaInicio = new Date(hoy);
          fechaInicio.setDate(hoy.getDate() - 6);
        } else if (filtroFecha === 'ultimos30') {
          fechaInicio = new Date(hoy);
          fechaInicio.setDate(hoy.getDate() - 29);
        }
        
        data = await pedidosAPI.getPorRango(
          fechaInicio.toISOString().split('T')[0],
          fechaFin.toISOString().split('T')[0]
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