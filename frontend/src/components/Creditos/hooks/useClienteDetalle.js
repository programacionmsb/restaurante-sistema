import { useState } from 'react';
import { creditosAPI } from '../../../services/apiCreditos';

export const useClienteDetalle = () => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [pedidosCliente, setPedidosCliente] = useState([]);
  const [resumenCliente, setResumenCliente] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const seleccionarCliente = async (cliente, usuarioId, permisos) => {
    setCargando(true);
    setError(null);
    try {
      const data = await creditosAPI.getPedidosCliente(cliente.nombre, usuarioId, permisos);
      setClienteSeleccionado(cliente);
      setPedidosCliente(data.pedidos);
      setResumenCliente(data.resumen);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const limpiarSeleccion = () => {
    setClienteSeleccionado(null);
    setPedidosCliente([]);
    setResumenCliente(null);
  };

  return {
    clienteSeleccionado,
    pedidosCliente,
    resumenCliente,
    cargando,
    error,
    setError,
    seleccionarCliente,
    limpiarSeleccion
  };
};