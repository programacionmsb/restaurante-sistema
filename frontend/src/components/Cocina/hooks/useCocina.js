import { useState, useEffect } from 'react';
import { pedidosAPI } from '../../../services/apiPedidos';

export const useCocina = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tiempos, setTiempos] = useState({});

  const cargarPedidos = async () => {
    try {
      const data = await pedidosAPI.getHoy();
      const pedidosCocina = data.filter(
        p => p.estado === 'pendiente' || p.estado === 'en_preparacion'
      );
      setPedidos(pedidosCocina);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarTiempos = () => {
    if (pedidos.length === 0) return;
    
    const nuevosTiempos = {};
    pedidos.forEach(pedido => {
      if (pedido.estado === 'en_preparacion' && pedido.inicioPreparacion) {
        const inicio = new Date(pedido.inicioPreparacion);
        const ahora = new Date();
        const diff = Math.floor((ahora - inicio) / 1000);
        nuevosTiempos[pedido._id] = diff;
      } else {
        nuevosTiempos[pedido._id] = 0;
      }
    });
    setTiempos(nuevosTiempos);
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    const tiempoInterval = setInterval(actualizarTiempos, 1000);
    return () => clearInterval(tiempoInterval);
  }, [pedidos]);

  return {
    pedidos,
    loading,
    tiempos,
    cargarPedidos
  };
};