import React, { useState } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useCreditos } from './hooks/useCreditos';
import { useClienteDetalle } from './hooks/useClienteDetalle';
import { useSocketCreditos } from './hooks/useSocketCreditos';
import { usePagoCredito } from './hooks/usePagoCredito';
import { CreditosListaClientes } from './components/CreditosListaClientes';
import { CreditosDetalleCliente } from './components/CreditosDetalleCliente';
import { CreditosModalPago } from './components/CreditosModalPago';
import { filtrarClientes } from './utils/creditosHelpers';
import './Creditos.css';

const CreditosView = () => {
  const [busqueda, setBusqueda] = useState('');

  // Custom hooks
  const { 
    clientes, 
    cargando: cargandoClientes, 
    error: errorClientes,
    setError: setErrorClientes,
    cargarClientes,
    usuario,
    permisos
  } = useCreditos();

  const {
    clienteSeleccionado,
    pedidosCliente,
    resumenCliente,
    cargando: cargandoDetalle,
    error: errorDetalle,
    setError: setErrorDetalle,
    seleccionarCliente,
    limpiarSeleccion
  } = useClienteDetalle();

  const {
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
  } = usePagoCredito();

  // Socket.IO
  useSocketCreditos(() => {
    cargarClientes();
    if (clienteSeleccionado) {
      seleccionarCliente(clienteSeleccionado, usuario._id, permisos);
    }
  });

  // Variables derivadas
  const tieneVerTodos = permisos.includes('creditos.ver_todos');
  const clientesFiltrados = filtrarClientes(clientes, busqueda);
  const error = errorClientes || errorDetalle;

  // Handlers
  const handleSeleccionarCliente = (cliente) => {
    seleccionarCliente(cliente, usuario._id, permisos);
  };

  const handleVolver = () => {
    limpiarSeleccion();
    cargarClientes();
  };

  const handleConfirmarPago = () => {
    procesarPago(
      clienteSeleccionado,
      resumenCliente,
      usuario._id,
      () => {
        limpiarSeleccion();
        cargarClientes();
      },
      (errorMsg) => setErrorDetalle(errorMsg)
    );
  };

  // VISTA: Lista de clientes
  if (!clienteSeleccionado) {
    return (
      <div className="creditos-container">
        <div className="creditos-header">
          <div className="creditos-header-content">
            <CreditCard size={32} />
            <div>
              <h1>Cobrar Créditos</h1>
              <p>{tieneVerTodos ? 'Todos los clientes' : 'Mis clientes'} con deuda</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="creditos-alert creditos-alert-error">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <CreditosListaClientes
          clientes={clientesFiltrados}
          busqueda={busqueda}
          onBuscar={setBusqueda}
          onSeleccionar={handleSeleccionarCliente}
          cargando={cargandoClientes}
          tieneVerTodos={tieneVerTodos}
        />
      </div>
    );
  }

  // VISTA: Detalle del cliente
  return (
    <div className="creditos-container">
      {error && (
        <div className="creditos-alert creditos-alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {cargandoDetalle ? (
        <div className="creditos-cargando">
          <div className="spinner"></div>
          <p>Cargando detalles...</p>
        </div>
      ) : (
        <CreditosDetalleCliente
          cliente={clienteSeleccionado}
          pedidos={pedidosCliente}
          resumen={resumenCliente}
          onVolver={handleVolver}
          onCobrar={abrirModal}
        />
      )}

      <CreditosModalPago
        mostrar={mostrarModalPago}
        tipoPago={tipoPago}
        setTipoPago={setTipoPago}
        montoPago={montoPago}
        setMontoPago={setMontoPago}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        resumenCliente={resumenCliente}
        procesando={procesando}
        onCerrar={cerrarModal}
        onConfirmar={handleConfirmarPago}
      />
    </div>
  );
};

export default CreditosView;