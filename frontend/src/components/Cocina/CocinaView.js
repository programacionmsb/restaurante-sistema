import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle, Flame } from 'lucide-react';
import { pedidosAPI } from '../../services/apiPedidos';
import './cocina.css';

export default function CocinaView() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tiempos, setTiempos] = useState({});

  useEffect(() => {
    cargarPedidos();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarPedidos, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Efecto separado para actualizar tiempos cada segundo
  useEffect(() => {
    const tiempoInterval = setInterval(() => {
      actualizarTiempos();
    }, 1000);
    
    return () => {
      clearInterval(tiempoInterval);
    };
  }, [pedidos]);

  const cargarPedidos = async () => {
    try {
      const data = await pedidosAPI.getHoy();
      // Solo pedidos pendientes y en preparación
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
      // Solo calcular tiempo si está en preparación
      if (pedido.estado === 'en_preparacion' && pedido.inicioPreparacion) {
        const inicio = new Date(pedido.inicioPreparacion);
        const ahora = new Date();
        const diff = Math.floor((ahora - inicio) / 1000); // segundos
        nuevosTiempos[pedido._id] = diff;
      } else {
        // Si está pendiente, tiempo es 0
        nuevosTiempos[pedido._id] = 0;
      }
    });
    setTiempos(nuevosTiempos);
  };

  const formatTiempo = (segundos) => {
    if (!segundos || segundos === 0) return '-'; // Mostrar guión si no hay tiempo
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleIniciarPreparacion = async (id) => {
    try {
      await pedidosAPI.updateEstado(id, 'en_preparacion');
      cargarPedidos();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMarcarListo = async (id) => {
    try {
      await pedidosAPI.updateEstado(id, 'completado');
      cargarPedidos();
    } catch (error) {
      alert(error.message);
    }
  };

  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const pedidosEnPreparacion = pedidos.filter(p => p.estado === 'en_preparacion');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <ChefHat size={48} className="loading-icon" />
          <h2>Cargando pedidos...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="cocina-container">
      {/* Header */}
      <header className="cocina-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ChefHat size={32} color="#ef4444" />
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>Cocina</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Vista en Tiempo Real</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="cocina-main">
        {/* Estadísticas */}
        <div className="cocina-stats">
          <div className="cocina-stat-card">
            <div className="cocina-stat-label">Pendientes</div>
            <div className="cocina-stat-value" style={{ color: '#ef4444' }}>
              {pedidosPendientes.length}
            </div>
          </div>
          <div className="cocina-stat-card">
            <div className="cocina-stat-label">En Preparación</div>
            <div className="cocina-stat-value" style={{ color: '#f59e0b' }}>
              {pedidosEnPreparacion.length}
            </div>
          </div>
          <div className="cocina-stat-card">
            <div className="cocina-stat-label">Total Activos</div>
            <div className="cocina-stat-value" style={{ color: '#1f2937' }}>
              {pedidos.length}
            </div>
          </div>
        </div>

        {/* Grid de Pedidos */}
        {pedidos.length === 0 ? (
          <div className="cocina-vacio">
            <div className="cocina-vacio-icono">🎉</div>
            <div className="cocina-vacio-texto">¡Todo listo!</div>
            <div className="cocina-vacio-subtexto">No hay pedidos pendientes en este momento</div>
          </div>
        ) : (
          <div className="cocina-pedidos-grid">
            {pedidos.map((pedido) => {
              const tiempoTranscurrido = tiempos[pedido._id] || 0;
              const esUrgente = tiempoTranscurrido > 600; // Más de 10 minutos

              return (
                <div 
                  key={pedido._id} 
                  className={`cocina-pedido-card ${pedido.estado}`}
                >
                  {esUrgente && pedido.estado === 'en_preparacion' && (
                    <div className="cocina-pedido-urgente">
                      <Flame size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      URGENTE
                    </div>
                  )}

                  {/* Header */}
                  <div className="cocina-pedido-header">
                    <div>
                      <div className="cocina-pedido-mesa">Mesa {pedido.mesa}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        {pedido.cliente}
                      </div>
                    </div>
                    <div className="cocina-pedido-tiempo">
                      <div className="cocina-pedido-tiempo-transcurrido">
                        {formatTiempo(tiempoTranscurrido)}
                      </div>
                      <div className="cocina-pedido-tiempo-label">
                        <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                        {pedido.estado === 'pendiente' ? 'Esperando' : 'Preparando'}
                      </div>
                    </div>
                  </div>

                  {/* Items CON OBSERVACIONES */}
                  <div className="cocina-pedido-items">
                    {pedido.items.map((item, index) => (
                      <div key={index} className="cocina-pedido-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span className="cocina-pedido-item-nombre">{item.nombre}</span>
                          <span className="cocina-pedido-item-cantidad">x{item.cantidad}</span>
                        </div>
                        {/* MOSTRAR OBSERVACIONES SI EXISTEN */}
                        {item.observaciones && (
                          <div style={{
                            fontSize: '0.7rem',
                            color: '#ef4444',
                            fontStyle: 'italic',
                            marginTop: '0.25rem',
                            background: '#fee2e2',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px dashed #ef4444',
                            width: '100%'
                          }}>
                            📝 {item.observaciones}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Estado */}
                  <div style={{ marginBottom: '1rem' }}>
                    {pedido.estado === 'pendiente' && (
                      <div style={{ 
                        background: '#fee2e2', 
                        color: '#991b1b', 
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}>
                        ⏳ Esperando Preparación
                      </div>
                    )}
                    {pedido.estado === 'en_preparacion' && (
                      <div style={{ 
                        background: '#fef3c7', 
                        color: '#92400e', 
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}>
                        🔥 En Preparación
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="cocina-pedido-acciones">
                    {pedido.estado === 'pendiente' && (
                      <button 
                        className="btn-cocina-accion btn-iniciar-preparacion"
                        onClick={() => handleIniciarPreparacion(pedido._id)}
                      >
                        <Flame size={20} />
                        Iniciar Preparación
                      </button>
                    )}

                    {pedido.estado === 'en_preparacion' && (
                      <button 
                        className="btn-cocina-accion btn-marcar-listo"
                        onClick={() => handleMarcarListo(pedido._id)}
                      >
                        <CheckCircle size={20} />
                        Marcar como Listo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}