import React, { useState, useEffect } from 'react';
import { CreditCard, Search, DollarSign, Users, AlertCircle, TrendingUp, Clock, ChevronRight, ArrowLeft, X } from 'lucide-react';
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
  const [tipoPago, setTipoPago] = useState('todo');
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
      
      console.log('=== RESPUESTA API ===');
      console.log('Tipo de data:', typeof data);
      console.log('¿Es array?', Array.isArray(data));
      console.log('Data:', data);
      
      // CORREGIR: Convertir a array si viene como objeto con índices numéricos
      let clientesArray = data;
      if (!Array.isArray(data)) {
        if (typeof data === 'object' && data !== null) {
          // Si es un objeto con índices numéricos, convertir a array
          clientesArray = Object.values(data);
        }
      }
      
      console.log('Clientes procesados:', clientesArray);
      setClientes(clientesArray);
    } catch (err) {
      console.error('Error cargando clientes:', err);
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

  const clientesFiltrados = Array.isArray(clientes) ? clientes.filter(c => 
    c.nombre && c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono && c.telefono.includes(busqueda)
  ) : [];

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

        <div className="creditos-busqueda">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar cliente por nombre o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {cargando ? (
          <div className="creditos-cargando">
            <div className="spinner"></div>
            <p>Cargando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="creditos-vacio">
            <Users size={64} />
            <h3>No hay clientes con deuda</h3>
            <p>{busqueda ? 'No se encontraron resultados para tu búsqueda' : 'Todos los créditos están al día'}</p>
          </div>
        ) : (
          <div className="creditos-lista">
            {clientesFiltrados.map((cliente, idx) => (
              <div
                key={idx}
                className="creditos-cliente-card"
                onClick={() => seleccionarCliente(cliente)}
              >
                <div className="creditos-cliente-info">
                  <div className="creditos-cliente-avatar">
                    {cliente.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="creditos-cliente-datos">
                    <h3>{cliente.nombre}</h3>
                    {cliente.telefono && (
                      <p className="creditos-cliente-telefono">📱 {cliente.telefono}</p>
                    )}
                    <p className="creditos-cliente-pedidos">
                      {cliente.cantidadPedidos} pedido{cliente.cantidadPedidos !== 1 ? 's' : ''}
                    </p>
                    {tieneVerTodos && cliente.mesero && (
                      <p className="creditos-cliente-mesero">
                        👤 Mesero: {cliente.mesero.nombre}
                      </p>
                    )}
                  </div>
                </div>
                <div className="creditos-cliente-monto">
                  <span className="creditos-monto-label">Debe</span>
                  <span className="creditos-monto-valor">{formatearMoneda(cliente.totalDeuda)}</span>
                  <ChevronRight size={24} />
                </div>
              </div>
            ))}
          </div>
        )}

        {clientesFiltrados.length > 0 && (
          <div className="creditos-resumen-global">
            <div className="creditos-stat">
              <Users size={20} />
              <div>
                <span className="creditos-stat-label">Clientes</span>
                <span className="creditos-stat-valor">{clientesFiltrados.length}</span>
              </div>
            </div>
            <div className="creditos-stat">
              <TrendingUp size={20} />
              <div>
                <span className="creditos-stat-label">Total por cobrar</span>
                <span className="creditos-stat-valor">
                  {formatearMoneda(clientesFiltrados.reduce((sum, c) => sum + c.totalDeuda, 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // VISTA: Detalle del cliente
  return (
    <div className="creditos-container">
      <div className="creditos-header">
        <button className="creditos-btn-back" onClick={() => {
          setClienteSeleccionado(null);
          setPedidosCliente([]);
          setResumenCliente(null);
        }}>
          <ArrowLeft size={20} />
        </button>
        <div className="creditos-header-content">
          <div className="creditos-cliente-avatar-grande">
            {clienteSeleccionado.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1>{clienteSeleccionado.nombre}</h1>
            {clienteSeleccionado.telefono && <p>📱 {clienteSeleccionado.telefono}</p>}
          </div>
        </div>
      </div>

      {error && (
        <div className="creditos-alert creditos-alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {resumenCliente && (
        <div className="creditos-resumen-cliente">
          <div className="creditos-resumen-card">
            <span className="creditos-resumen-label">Total Original</span>
            <span className="creditos-resumen-valor">{formatearMoneda(resumenCliente.totalOriginal)}</span>
          </div>
          <div className="creditos-resumen-card creditos-resumen-pagado">
            <span className="creditos-resumen-label">Pagado</span>
            <span className="creditos-resumen-valor">{formatearMoneda(resumenCliente.totalPagado)}</span>
          </div>
          <div className="creditos-resumen-card creditos-resumen-deuda">
            <span className="creditos-resumen-label">Deuda Actual</span>
            <span className="creditos-resumen-valor">{formatearMoneda(resumenCliente.totalDeuda)}</span>
          </div>
        </div>
      )}

      <div className="creditos-acciones">
        <button className="creditos-btn-cobrar" onClick={abrirModalPago}>
          <DollarSign size={20} />
          Cobrar Crédito
        </button>
      </div>

      <div className="creditos-pedidos-lista">
        <h2>Pedidos ({pedidosCliente.length})</h2>
        {pedidosCliente.map((pedido, idx) => (
          <div key={idx} className="creditos-pedido-card">
            <div className="creditos-pedido-header">
              <div>
                <span className="creditos-pedido-mesa">{pedido.mesa}</span>
                <span className="creditos-pedido-fecha">{formatearFecha(pedido.fecha)}</span>
              </div>
              <span className={`creditos-pedido-estado creditos-estado-${pedido.estadoPago}`}>
                {pedido.estadoPago === 'credito' ? 'Crédito' : 'Pago Parcial'}
              </span>
            </div>
            <div className="creditos-pedido-montos">
              <div className="creditos-pedido-monto">
                <span>Total:</span>
                <strong>{formatearMoneda(pedido.total)}</strong>
              </div>
              {pedido.montoPagado > 0 && (
                <div className="creditos-pedido-monto creditos-monto-pagado">
                  <span>Pagado:</span>
                  <strong>{formatearMoneda(pedido.montoPagado)}</strong>
                </div>
              )}
              <div className="creditos-pedido-monto creditos-monto-resta">
                <span>Resta:</span>
                <strong>{formatearMoneda(pedido.montoRestante)}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE PAGO */}
      {mostrarModalPago && (
        <div className="creditos-modal-overlay" onClick={cerrarModalPago}>
          <div className="creditos-modal" onClick={(e) => e.stopPropagation()}>
            <div className="creditos-modal-header">
              <h2>Cobrar Crédito</h2>
              <button className="creditos-modal-cerrar" onClick={cerrarModalPago}>
                <X size={24} />
              </button>
            </div>

            <div className="creditos-modal-body">
              <div className="creditos-form-group">
                <label>Tipo de Pago</label>
                <div className="creditos-radio-group">
                  <label className="creditos-radio">
                    <input
                      type="radio"
                      value="todo"
                      checked={tipoPago === 'todo'}
                      onChange={(e) => setTipoPago(e.target.value)}
                    />
                    <span>Pagar Todo ({formatearMoneda(resumenCliente?.totalDeuda || 0)})</span>
                  </label>
                  <label className="creditos-radio">
                    <input
                      type="radio"
                      value="parcial"
                      checked={tipoPago === 'parcial'}
                      onChange={(e) => setTipoPago(e.target.value)}
                    />
                    <span>Pago Parcial</span>
                  </label>
                </div>
              </div>

              {tipoPago === 'parcial' && (
                <div className="creditos-form-group">
                  <label>Monto a Pagar *</label>
                  <div className="creditos-input-money">
                    <span>S/</span>
                    <input
                      type="number"
                      step="0.01"
                      value={montoPago}
                      onChange={(e) => setMontoPago(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <small>Deuda total: {formatearMoneda(resumenCliente?.totalDeuda || 0)}</small>
                </div>
              )}

              <div className="creditos-form-group">
                <label>Método de Pago *</label>
                <div className="creditos-metodos-pago">
                  <button
                    className={`creditos-metodo-btn ${metodoPago === 'efectivo' ? 'active' : ''}`}
                    onClick={() => setMetodoPago('efectivo')}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    className={`creditos-metodo-btn ${metodoPago === 'yape' ? 'active' : ''}`}
                    onClick={() => setMetodoPago('yape')}
                  >
                    📱 Yape
                  </button>
                  <button
                    className={`creditos-metodo-btn ${metodoPago === 'transferencia' ? 'active' : ''}`}
                    onClick={() => setMetodoPago('transferencia')}
                  >
                    🏦 Transferencia
                  </button>
                </div>
              </div>

              {tipoPago === 'parcial' && montoPago && (
                <div className="creditos-preview">
                  <p><strong>Se aplicará algoritmo FIFO:</strong></p>
                  <p>Los pedidos más antiguos se pagarán primero</p>
                </div>
              )}
            </div>

            <div className="creditos-modal-footer">
              <button className="creditos-btn-cancelar" onClick={cerrarModalPago}>
                Cancelar
              </button>
              <button 
                className="creditos-btn-confirmar" 
                onClick={procesarPago}
                disabled={procesando}
              >
                {procesando ? 'Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditosView;