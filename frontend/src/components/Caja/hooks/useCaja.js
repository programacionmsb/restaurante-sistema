import { useState, useEffect } from 'react';
import { pedidosAPI } from '../../../services/apiPedidos';

export const useCaja = (filtroFecha, fechaPersonalizada) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      let data;
      
      if (filtroFecha === 'hoy') {
        data = await pedidosAPI.getHoy();
      } else if (filtroFecha === 'personalizado' && fechaPersonalizada) {
        data = await pedidosAPI.getPorRango(fechaPersonalizada, fechaPersonalizada);
      } else {
        const hoy = new Date();
        let fechaInicio;
        
        if (filtroFecha === 'ayer') {
          fechaInicio = new Date(hoy);
          fechaInicio.setDate(hoy.getDate() - 1);
        } else if (filtroFecha === 'ultimos7') {
          fechaInicio = new Date(hoy);
          fechaInicio.setDate(hoy.getDate() - 6);
        } else if (filtroFecha === 'ultimos30') {
          fechaInicio = new Date(hoy);
          fechaInicio.setDate(hoy.getDate() - 29);
        }
        
        const fechaFin = new Date(hoy);
        
        data = await pedidosAPI.getPorRango(
          fechaInicio.toISOString().split('T')[0],
          fechaFin.toISOString().split('T')[0]
        );
      }
      
      setPedidos(data.filter(p => !p.cancelado));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, [filtroFecha, fechaPersonalizada]);

  return {
    pedidos,
    loading,
    cargarPedidos
  };
};