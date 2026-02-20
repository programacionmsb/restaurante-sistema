import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Clock, CheckCircle, DollarSign, Edit2, XCircle, Calendar, Users } from 'lucide-react';
import { pedidosAPI } from '../../services/apiPedidos';
import { authAPI } from '../../services/apiAuth';
import PedidoModal from './PedidoModal';
import ProtectedAction from '../ProtectedAction';
import './pedidos.css';

export default function PedidosList() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('hoy');
  const [fechaPersonalizada, setFechaPersonalizada] = useState('');
  const [mostrarSelectorFecha, setMostrarSelectorFecha] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState('todos');

  useEffect(() => {
    cargarPedidosPorFecha();
    cargarUsuarios();
  }, [filtroFecha, fechaPersonalizada]);

  const cargarUsuarios = async () => {
    try {
      const response = await fetch('https://restaurante-backend-a6o9.onrender.com/api/usuarios');
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

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
    } catch (error) {
      alert(error.message);
    }
  };

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
    setEditingPedido(null);
  };

  const handleCambiarFiltroFecha = (nuevoFiltro) => {
    setFiltroFecha(nuevoFiltro);
    if (nuevoFiltro === 'personalizado') {
      setMostrarSelectorFecha(true);
    } else {
      setMostrarSelectorFecha(false);
      setFechaPersonalizada('');
    }
  };

  const pedidosFiltrados = pedidos.filter(p => {
    let pasaEstado = false;
    if (filtroEstado === 'todos') pasaEstado = !p.cancelado;
    if (filtroEstado === 'pendientes') pasaEstado = p.estado === 'pendiente' && !p.cancelado;
    if (filtroEstado === 'en_preparacion') pasaEstado = p.estado === 'en_preparacion' && !p.cancelado;
    if (filtroEstado === 'completados') pasaEstado = p.estado === 'completado' && !p.cancelado;
    if (filtroEstado === 'por_cobrar') pasaEstado = p.estadoPago === 'pendiente' && !p.cancelado;
    if (filtroEstado === 'cancelados') pasaEstado = p.cancelado;
    
    let pasaUsuario = true;
    if (filtroUsuario !== 'todos' && p.usuarioCreador && p.usuarioCreador._id) {
      pasaUsuario = p.usuarioCreador._id === filtroUsuario;
    }
    
    return pasaEstado && pasaUsuario;
  });

  const formatFechaCompleta = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dia = dias[date.getDay()];
    const fechaStr = date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${dia} ${fechaStr}`;
  };

  const formatHoraSola = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const calcularTiempoPreparacion = (inicio, fin) => {
    if (!inicio || !fin) return '-';
    const inicioDate = new Date(inicio);
    const finDate = new Date(fin);
    const diff = Math.floor((finDate - inicioDate) / 1000);
    
    const horas = Math.floor(diff / 3600);
    const minutos = Math.floor((diff % 3600) / 60);
    const segundos = diff % 60;
    
    const partes = [];
    if (horas > 0) partes.push(`${horas.toString().padStart(2, '0')}`);
    partes.push(`${minutos.toString().padStart(2, '0')}`);
    partes.push(`${segundos.toString().padStart(2, '0')}`);
    
    return partes.join(':');
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      'pendiente': 'Pendiente',
      'en_preparacion': 'En Preparación',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return labels[estado] || estado;
  };

  const getFechaActual = () => {
    if (filtroFecha === 'hoy') {
      const hoy = new Date();
      return hoy.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    if (filtroFecha === 'ayer') {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      return ayer.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    if (filtroFecha === 'personalizado' && fechaPersonalizada) {
      const date = new Date(fechaPersonalizada + 'T00:00:00');
      return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return '';
  };

  const getFiltroFechaLabel = () => {
    if (filtroFecha === 'hoy') return 'Hoy';
    if (filtroFecha === 'ayer') return 'Ayer';
    if (filtroFecha === 'ultimos7') return 'Últimos 7 días';
    if (filtroFecha === 'ultimos30') return 'Últimos 30 días';
    if (filtroFecha === 'personalizado' && fechaPersonalizada) {
      const date = new Date(fechaPersonalizada + 'T00:00:00');
      return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return 'Seleccionar Fecha';
  };

  const getNombreUsuario = (usuarioData) => {
    if (!usuarioData) return 'Sistema';
    
    if (typeof usuarioData === 'string') {
      try {
        const parsed = JSON.parse(usuarioData);
        return parsed.nombre || 'Sistema';
      } catch (e) {
        return usuarioData;
      }
    }
    
    if (typeof usuarioData === 'object' && usuarioData.nombre) {
      return usuarioData.nombre;
    }
    
    return 'Sistema';
  };

  const puedeVerFiltroUsuarios = () => {
    const user = authAPI.getCurrentUser();
    if (!user || !user.rol || !user.rol.permisos) return false;
    return user.rol.permisos.includes('pedidos.ver_todos');
  };

  const estadisticas = {
    total: pedidosFiltrados.filter(p => !p.cancelado).length,
    pendientes: pedidosFiltrados.filter(p => p.estado === 'pendiente' && !p.cancelado).length,
    enPreparacion: pedidosFiltrados.filter(p => p.estado === 'en_preparacion' && !p.cancelado).length,
    completados: pedidosFiltrados.filter(p => p.estado === 'completado' && !p.cancelado).length,
    porCobrar: pedidosFiltrados.filter(p => p.estadoPago === 'pendiente' && !p.cancelado).length,
    cancelados: pedidosFiltrados.filter(p => p.cancelado).length,
    totalVentas: pedidosFiltrados.filter(p => !p.cancelado).reduce((sum, p) => sum + p.total, 0)
  };

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
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Pedidos</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>{estadisticas.total}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Pendientes</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>{estadisticas.pendientes}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>En Preparación</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>{estadisticas.enPreparacion}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Por Cobrar</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>{estadisticas.porCobrar}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Ventas</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>S/ {estadisticas.totalVentas.toFixed(2)}</div>
          </div>
        </div>

        <div className="pedidos-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
              Pedidos: {getFechaActual()} ({pedidosFiltrados.length})
            </h2>
            
            <ProtectedAction permisos={['pedidos.crear']}>
              <button
                onClick={() => setModalOpen(true)}
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

          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginBottom: '1rem',
            flexWrap: 'wrap',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.75rem'
          }}>
            <button
              onClick={() => handleCambiarFiltroFecha('hoy')}
              style={{
                padding: '0.5rem 1rem',
                background: filtroFecha === 'hoy' ? '#f59e0b' : 'white',
                color: filtroFecha === 'hoy' ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Hoy
            </button>
            <button
              onClick={() => handleCambiarFiltroFecha('ayer')}
              style={{
                padding: '0.5rem 1rem',
                background: filtroFecha === 'ayer' ? '#f59e0b' : 'white',
                color: filtroFecha === 'ayer' ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Ayer
            </button>
            <button
              onClick={() => handleCambiarFiltroFecha('ultimos7')}
              style={{
                padding: '0.5rem 1rem',
                background: filtroFecha === 'ultimos7' ? '#f59e0b' : 'white',
                color: filtroFecha === 'ultimos7' ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => handleCambiarFiltroFecha('ultimos30')}
              style={{
                padding: '0.5rem 1rem',
                background: filtroFecha === 'ultimos30' ? '#f59e0b' : 'white',
                color: filtroFecha === 'ultimos30' ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Últimos 30 días
            </button>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Calendar size={16} style={{ color: '#6b7280' }} />
              <input
                type="date"
                value={fechaPersonalizada}
                onChange={(e) => {
                  setFechaPersonalizada(e.target.value);
                  handleCambiarFiltroFecha('personalizado');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              />
            </div>

            {puedeVerFiltroUsuarios() && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
                <Users size={16} style={{ color: '#6b7280' }} />
                <select
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    background: 'white',
                    fontWeight: '600'
                  }}
                >
                  <option value="todos">Todos los usuarios</option>
                  {usuarios.map(usuario => (
                    <option key={usuario._id} value={usuario._id}>
                      {usuario.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

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

          <div className="pedidos-grid">
            {pedidosFiltrados.map((pedido) => (
              <div key={pedido._id} className={`pedido-card ${pedido.estado} ${pedido.cancelado ? 'cancelado' : ''}`}>
                <div className="pedido-header">
                  <div>
                    <div className="pedido-mesa">Mesa {pedido.mesa}</div>
                    <div className="pedido-cliente">{pedido.cliente}</div>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{ color: '#6b7280', fontWeight: '600' }}>Fecha</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} style={{ color: '#6b7280' }} />
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>
                        {formatFechaCompleta(pedido.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>Pedido:</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>
                      {formatHoraSola(pedido.createdAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>Preparación:</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>
                      {formatHoraSola(pedido.inicioPreparacion)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>Listo:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>
                        {formatHoraSola(pedido.finPreparacion)}
                      </span>
                      {pedido.inicioPreparacion && pedido.finPreparacion && (
                        <span style={{ 
                          color: '#10b981',
                          fontWeight: '700',
                          fontSize: '0.875rem'
                        }}>
                          - {calcularTiempoPreparacion(pedido.inicioPreparacion, pedido.finPreparacion)}
                        </span>
                      )}
                    </div>
                  </div>

                  {pedido.usuarioCreador && pedido.usuarioCreador.nombre && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <span style={{ color: '#6b7280' }}>Mesero:</span>
                      <span style={{ fontWeight: '600', color: '#667eea' }}>
                        {pedido.usuarioCreador.nombre}
                      </span>
                    </div>
                  )}
                </div>

                {pedido.cancelado && (
                  <div style={{
                    background: '#fee2e2',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    border: '2px solid #fca5a5'
                  }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#991b1b', 
                      fontWeight: '700', 
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <XCircle size={16} />
                      PEDIDO CANCELADO
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#7f1d1d', lineHeight: '1.5' }}>
                      <div><strong>Motivo:</strong> {pedido.motivoCancelacion || 'No especificado'}</div>
                      <div><strong>Por:</strong> {getNombreUsuario(pedido.usuarioCancelacion)}</div>
                      <div><strong>Fecha:</strong> {new Date(pedido.fechaCancelacion).toLocaleString('es-PE', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</div>
                    </div>
                  </div>
                )}

                <div className="pedido-items">
                  {pedido.items.map((item, index) => (
                    <div key={index} className="pedido-item">
                      <span className="pedido-item-nombre">{item.nombre}</span>
                      <span className="pedido-item-cantidad">x{item.cantidad}</span>
                    </div>
                  ))}
                </div>

                <div className="pedido-total">
                  <span>Total:</span>
                  <span>S/ {pedido.total.toFixed(2)}</span>
                </div>

                {!pedido.cancelado && (
                  <div className="pedido-estados">
                    <span className={`estado-badge ${pedido.estado}`}>
                      {getEstadoLabel(pedido.estado)}
                    </span>
                    <span className={`estado-badge pago-${pedido.estadoPago}`}>
                      {pedido.estadoPago === 'pagado' ? 'Pagado' : pedido.estadoPago === 'credito' ? 'A Crédito' : 'Por Cobrar'}
                    </span>
                  </div>
                )}

                {!pedido.cancelado && (
                  <div className="pedido-acciones">
                    {pedido.estado === 'pendiente' && (
                      <ProtectedAction permisos={['cocina.actualizar']}>
                        <button 
                          className="btn-accion btn-cocina"
                          onClick={() => handleUpdateEstado(pedido._id, 'en_preparacion')}
                        >
                          Iniciar Preparación
                        </button>
                      </ProtectedAction>
                    )}

                    {pedido.estado === 'en_preparacion' && (
                      <ProtectedAction permisos={['cocina.actualizar']}>
                        <button 
                          className="btn-accion btn-completar"
                          onClick={() => handleUpdateEstado(pedido._id, 'completado')}
                        >
                          <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                          Marcar Listo
                        </button>
                      </ProtectedAction>
                    )}

                    {pedido.estado === 'completado' && pedido.estadoPago === 'pendiente' && (
                      <ProtectedAction permisos={['caja.cobrar']}>
                        <button 
                          className="btn-accion btn-cobrar"
                          onClick={() => {
                            const tienePermisoCredito = authAPI.hasPermission('creditos.crear');
                            const opciones = tienePermisoCredito 
                              ? 'Método de pago:\n1. Efectivo\n2. Yape\n3. Transferencia\n4. Crédito'
                              : 'Método de pago:\n1. Efectivo\n2. Yape\n3. Transferencia';
                            
                            const metodo = prompt(opciones, '1');
                            const metodos = { 
                              '1': 'efectivo', 
                              '2': 'yape', 
                              '3': 'transferencia',
                              '4': 'credito'
                            };
                            
                            if (metodos[metodo]) {
                              if (metodo === '4' && !tienePermisoCredito) {
                                alert('No tienes permiso para autorizar créditos');
                                return;
                              }
                              
                              if (metodo === '4') {
                                if (window.confirm(`¿Marcar pedido de "${pedido.cliente}" como crédito?`)) {
                                  handleRegistrarPago(pedido._id, metodos[metodo]);
                                }
                              } else {
                                handleRegistrarPago(pedido._id, metodos[metodo]);
                              }
                            }
                          }}
                        >
                          <DollarSign size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                          Cobrar
                        </button>
                      </ProtectedAction>
                    )}

                    {pedido.estado === 'pendiente' && pedido.estadoPago === 'pendiente' && (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        marginTop: '0.5rem' 
                      }}>
                        <button 
                          className="btn-accion btn-editar"
                          onClick={() => handleEditarPedido(pedido)}
                          style={{
                            background: '#dbeafe',
                            color: '#1e40af',
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          <Edit2 size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                          Editar
                        </button>

                        <button 
                          className="btn-accion btn-cancelar"
                          onClick={() => handleCancelarPedido(pedido._id)}
                          style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          <XCircle size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {pedidosFiltrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              No hay pedidos con este filtro
            </div>
          )}
        </div>
      </main>

      {modalOpen && (
        <PedidoModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={cargarPedidosPorFecha}
          pedidoEditar={editingPedido}
        />
      )}
    </div>
  );
}