import React, { useState, useEffect } from 'react';
import { CreditCard, Search, DollarSign, Users, AlertCircle, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { creditosAPI } from '../../services/apiCreditos';
import { authAPI } from '../../services/apiAuth';
import './Creditos.css';

const CreditosView = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [pedidosCliente, setPedidosCliente] = useState([]);
  const [resumenCliente, setResumenCliente] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Modal de pago
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [tipoPago, setTipoPago] = useState('todo'); // 'todo' o 'parcial'
  const [montoPago, setMontoPago] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [procesando, setProcesando] = useState(false);

  const usuario = authAPI.getCurrentUser();
  const permisos = usuario?.rol?.permisos || [];
  const tieneVerTodos = permisos.includes('creditos.ver_todos');

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await creditosAPI.getClientesConDeuda(usuario._id, permisos);
      setClientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const seleccionarCliente = async (cliente) => {
    setCargando(true);
    setError(null);
    try {
      const data = await creditosAPI.getPedidosCliente(cliente.nombre, usuario._id, permisos);
      setClienteSeleccionado(cliente);
      setPedidosCliente(data.pedidos);
      setResumenCliente(data.resumen);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalPago = () => {
    setMostrarModalPago(true);
    setTipoPago('todo');
    setMontoPago('');
    setMetodoPago('efectivo');
  };

  const cerrarModalPago = () => {
    setMostrarModalPago(false);
    setTipoPago('todo');
    setMontoPago('');
    setMetodoPago('efectivo');
  };

  const procesarPago = async () => {
    if (tipoPago === 'parcial' && (!montoPago || parseFloat(montoPago) <= 0)) {
      setError('Ingresa un monto válido');
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      const datos = {
        nombreCliente: clienteSeleccionado.nombre,
        monto: tipoPago === 'parcial' ? parseFloat(montoPago) : resumenCliente.totalDeuda,
        metodoPago,
        pagarTodo: tipoPago === 'todo',
        usuarioId: usuario._id
      };

      const resultado = await creditosAPI.procesarPago(datos);
      
      alert(`✅ Pago procesado exitosamente\n\n${resultado.detalles.aplicacion.length} pedido(s) afectado(s)\nNueva deuda: S/ ${resultado.detalles.nuevaDeuda.toFixed(2)}`);
      
      cerrarModalPago();
      setClienteSeleccionado(null);
      setPedidosCliente([]);
      setResumenCliente(null);
      cargarClientes();

    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono.includes(busqueda)
  );

  const formatearMoneda = (monto) => {
    return `S/ ${monto.toFixed(2)}`;
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // CONTINÚA EN LA SIGUIENTE PARTE...
  return (
    <div className="creditos-container">
      {/* Renderizado aquí */}
    </div>
  );
};

export default CreditosView;