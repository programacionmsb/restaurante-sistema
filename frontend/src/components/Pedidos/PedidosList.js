import React, { useState } from 'react';
import { ShoppingCart, Plus, RefreshCw, Search } from 'lucide-react';
import { pedidosAPI } from '../../services/apiPedidos';
import { authAPI } from '../../services/apiAuth';
import PedidoModal from './PedidoModal';
import ProtectedAction from '../ProtectedAction';
import { usePedidos } from './hooks/usePedidos';
import { useSocketPedidos } from './hooks/useSocketPedidos';
import { PedidosEstadisticas } from './components/PedidosEstadisticas';
import { PedidosFiltros } from './components/PedidosFiltros';
import { PedidoCard } from './components/PedidoCard';
import { ModalPago } from '../Caja/components/ModalPago';
import { calcularEstadisticas, getFechaActual } from './utils/pedidosHelpers';
import './pedidos.css';

export default function PedidosList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConFecha, setModalConFecha] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('hoy');
  const [fechaPersonalizada, setFechaPersonalizada] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [pedidoParaPagar, setPedidoParaPagar] = useState(null);

  // Custom hooks
  const { pedidos, loading, cargarPedidosPorFecha } = usePedidos(filtroFecha, fechaPersonalizada);
  const { actualizacionesPendientes } = useSocketPedidos(cargarPedidosPorFecha, modalOpen);

  // Handlers
  const handleUpdateEstado = async (id, nuevoEstado) => {
    try {
      await pedidosAPI.updateEstado(id, nuevoEstado);
      cargarPedidosPorFecha();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRegistrarPago = async (id, metodoPago) => {
    try {
      const usuario = authAPI.getCurrentUser();
      await pedidosAPI.registrarPago(id, metodoPago, usuario._id);
      cargarPedidosPorFecha();
      setPedidoParaPagar(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAbrirPago = (pedido) => setPedidoParaPagar(pedido);

  const handleCancelarPedido = async (id) => {
    const motivo = prompt('Ingrese el motivo de cancelación:');
    if (!motivo || motivo.trim() === '') {
      alert('Debe ingresar un motivo para cancelar el pedido');
      return;
    }

    const usuarioData = localStorage.getItem('usuario');
    let nombreUsuario = 'Sistema';
    
    if (usuarioData) {
      try {
        const usuario = JSON.parse(usuarioData);
        nombreUsuario = usuario.nombre || 'Sistema';
      } catch (e) {
        nombreUsuario = usuarioData;
      }
    }
    
    if (window.confirm(`¿Está seguro de cancelar este pedido?\nMotivo: ${motivo}`)) {
      try {
        await pedidosAPI.cancelar(id, motivo, nombreUsuario);
        cargarPedidosPorFecha();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleEditarPedido = (pedido) => {
    setEditingPedido(pedido);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalConFecha(false);
    setEditingPedido(null);
  };

  const handleCambiarFiltroFecha = (nuevoFiltro) => {
    setFiltroFecha(nuevoFiltro);
    if (nuevoFiltro !== 'personalizado') {
      setFechaPersonalizada('');
    }
  };

  // Calcular estadísticas
  const { pedidosFiltrados, ...estadisticas } = calcularEstadisticas(pedidos, filtroEstado, filtroUsuario);

  // Filtrar por búsqueda (cliente o mesa)
  const pedidosBuscados = busqueda.trim()
    ? pedidosFiltrados.filter(p =>
        p.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.mesa?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : pedidosFiltrados;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <ShoppingCart size={48} className="loading-icon" />
          <h2>Cargando pedidos...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="pedidos-container">
      {/* Header */}
      <header className="pedidos-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShoppingCart size={32} color="#f59e0b" />
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>RestaurantePRO</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Gestión de Pedidos</p>
          </div>
        </div>
      </header>

      <main className="pedidos-main">
        {/* Indicador de actualizaciones pendientes */}
        {actualizacionesPendientes && !modalOpen && (
          <div style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '0.5rem',
            padding: '1rem 1.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease'
          }}>
            <RefreshCw size={20} color="#f59e0b" style={{ animation: 'spin 2s linear infinite' }} />
            <span style={{ fontWeight: '600', color: '#92400e' }}>
              Hay actualizaciones disponibles
            </span>
            <button
              onClick={cargarPedidosPorFecha}
              style={{
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Actualizar ahora
            </button>
          </div>
        )}

        {/* Estadísticas */}
        <PedidosEstadisticas estadisticas={estadisticas} />

        <div className="pedidos-card">
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
              Pedidos: {getFechaActual(filtroFecha, fechaPersonalizada)} ({pedidosBuscados.length})
            </h2>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {authAPI.getCurrentUser()?.rol?.nombre === 'Administrador' && (
                <button
                  onClick={() => { setModalConFecha(true); setModalOpen(true); }}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title="Registrar un pedido de una fecha anterior"
                >
                  <Plus size={20} />
                  Registrar Pendiente
                </button>
              )}

              <ProtectedAction permisos={['pedidos.crear']}>
                <button
                  onClick={() => { setModalConFecha(false); setModalOpen(true); }}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Plus size={20} />
                  Nuevo Pedido
                </button>
              </ProtectedAction>
            </div>
          </div>

          {/* Filtros */}
          <PedidosFiltros 
            filtroFecha={filtroFecha}
            onCambiarFiltroFecha={handleCambiarFiltroFecha}
            fechaPersonalizada={fechaPersonalizada}
            onCambiarFechaPersonalizada={setFechaPersonalizada}
            filtroUsuario={filtroUsuario}
            onCambiarFiltroUsuario={setFiltroUsuario}
          />

          {/* Tabs de Estado */}
          <div className="pedidos-tabs">
            <button 
              className={`pedido-tab ${filtroEstado === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('todos')}
            >
              Todos ({estadisticas.total})
            </button>
            <button 
              className={`pedido-tab ${filtroEstado === 'pendientes' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('pendientes')}
            >
              Pendientes ({estadisticas.pendientes})
            </button>
            <button 
              className={`pedido-tab ${filtroEstado === 'en_preparacion' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('en_preparacion')}
            >
              En Preparación ({estadisticas.enPreparacion})
            </button>
            <button 
              className={`pedido-tab ${filtroEstado === 'completados' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('completados')}
            >
              Completados ({estadisticas.completados})
            </button>
            <button 
              className={`pedido-tab ${filtroEstado === 'por_cobrar' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('por_cobrar')}
            >
              Por Cobrar ({estadisticas.porCobrar})
            </button>
            <button 
              className={`pedido-tab ${filtroEstado === 'cancelados' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('cancelados')}
            >
              Cancelados ({estadisticas.cancelados})
            </button>
          </div>

          {/* Buscador */}
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Buscar por cliente o mesa..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  fontSize: '1.1rem',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Grid de Pedidos */}
          <div className="pedidos-grid">
            {pedidosBuscados.map((pedido) => (
              <PedidoCard
                key={pedido._id}
                pedido={pedido}
                onUpdateEstado={handleUpdateEstado}
                onRegistrarPago={handleRegistrarPago}
                onCobrar={handleAbrirPago}
                onCancelar={handleCancelarPedido}
                onEditar={handleEditarPedido}
              />
            ))}
          </div>

          {pedidosBuscados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay pedidos con este filtro'}
            </div>
          )}
        </div>
      </main>

      {/* Modal de pedido */}
      {modalOpen && (
        <PedidoModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={cargarPedidosPorFecha}
          pedidoEditar={editingPedido}
          conFechaManual={modalConFecha}
        />
      )}

      {/* Modal de pago */}
      {pedidoParaPagar && (
        <ModalPago
          pedido={pedidoParaPagar}
          onClose={() => setPedidoParaPagar(null)}
          onPagar={(metodoPago) => handleRegistrarPago(pedidoParaPagar._id, metodoPago)}
        />
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}