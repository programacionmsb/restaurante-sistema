import { useState } from 'react';
import { creditosAPI } from '../../../services/apiCreditos';

export const usePagoCredito = () => {
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [tipoPago, setTipoPago] = useState('todo');
  const [montoPago, setMontoPago] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [procesando, setProcesando] = useState(false);

  const abrirModal = () => {
    setMostrarModalPago(true);
    setTipoPago('todo');
    setMontoPago('');
    setMetodoPago('efectivo');
  };

  const cerrarModal = () => {
    setMostrarModalPago(false);
    setTipoPago('todo');
    setMontoPago('');
    setMetodoPago('efectivo');
  };

  const procesarPago = async (clienteSeleccionado, resumenCliente, usuarioId, onSuccess, onError) => {
    if (tipoPago === 'parcial' && (!montoPago || parseFloat(montoPago) <= 0)) {
      onError('Ingresa un monto válido');
      return;
    }

    setProcesando(true);

    try {
      const datos = {
        nombreCliente: clienteSeleccionado.nombre,
        monto: tipoPago === 'parcial' ? parseFloat(montoPago) : resumenCliente.totalDeuda,
        metodoPago,
        pagarTodo: tipoPago === 'todo',
        usuarioId
      };

      const resultado = await creditosAPI.procesarPago(datos);
      
      alert(`✅ Pago procesado exitosamente\n\n${resultado.detalles.aplicacion.length} pedido(s) afectado(s)\nNueva deuda: S/ ${resultado.detalles.nuevaDeuda.toFixed(2)}`);
      
      cerrarModal();
      onSuccess();

    } catch (err) {
      onError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  return {
    mostrarModalPago,
    tipoPago,
    setTipoPago,
    montoPago,
    setMontoPago,
    metodoPago,
    setMetodoPago,
    procesando,
    abrirModal,
    cerrarModal,
    procesarPago
  };
};