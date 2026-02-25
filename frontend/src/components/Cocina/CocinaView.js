import React, { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { pedidosAPI } from '../../services/apiPedidos';
import { useCocina } from './hooks/useCocina';
import { useSocketCocina } from './hooks/useSocketCocina';
import { CocinaEstadisticas } from './components/CocinaEstadisticas';
import { CocinaFiltros } from './components/CocinaFiltros';
import { CocinaPedidoCard } from './components/CocinaPedidoCard';
import {
  calcularEstadisticasItems,
  calcularEstadisticasItemsPorDestino,
  filtrarPedidos,
  obtenerMeserosUnicos,
  obtenerClientesUnicos,
} from './utils/cocinaHelpers';
import './cocina.css';

export default function CocinaView() {
  const [filtroMesero, setFiltroMesero] = useState('todos');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('todos');
  const [filtroDestino, setFiltroDestino] = useState('todos');

  const { pedidos, loading, tiempos, cargarPedidos } = useCocina();
  useSocketCocina(cargarPedidos);

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

  const pedidosFiltrados = filtrarPedidos(pedidos, filtroMesero, busquedaCliente);

  const pedidosPendientes = pedidosFiltrados.filter(p => p.estado === 'pendiente').length;
  const pedidosEnPreparacion = pedidosFiltrados.filter(p => p.estado === 'en_preparacion').length;

  const itemsStats = calcularEstadisticasItems(pedidosFiltrados, filtroCliente);
  const itemsStatsPorDestino = calcularEstadisticasItemsPorDestino(pedidosFiltrados, filtroDestino);

  const clientes = obtenerClientesUnicos(pedidosFiltrados);
  const meseros = obtenerMeserosUnicos(pedidos);

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
      <header className="cocina-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ChefHat size={32} color="#ef4444" />
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>Cocina</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Vista en Tiempo Real</p>
          </div>
        </div>
      </header>

      <main className="cocina-main">
        <CocinaEstadisticas
          pedidosPendientes={pedidosPendientes}
          pedidosEnPreparacion={pedidosEnPreparacion}
          totalPedidos={pedidosFiltrados.length}
          itemsStats={itemsStats}
          clientes={clientes}
          filtroCliente={filtroCliente}
          onCambiarFiltroCliente={setFiltroCliente}
          itemsStatsPorDestino={itemsStatsPorDestino}
          filtroDestino={filtroDestino}
          onCambiarFiltroDestino={setFiltroDestino}
        />

        <CocinaFiltros
          meseros={meseros}
          filtroMesero={filtroMesero}
          onCambiarFiltroMesero={setFiltroMesero}
          busquedaCliente={busquedaCliente}
          onCambiarBusquedaCliente={setBusquedaCliente}
        />

        {pedidosFiltrados.length === 0 ? (
          <div className="cocina-vacio">
            <div className="cocina-vacio-icono">🎉</div>
            <div className="cocina-vacio-texto">
              {pedidos.length === 0 ? '¡Todo listo!' : 'No hay pedidos con este filtro'}
            </div>
            <div className="cocina-vacio-subtexto">
              {pedidos.length === 0
                ? 'No hay pedidos pendientes en este momento'
                : 'Intenta cambiar los filtros de búsqueda'}
            </div>
          </div>
        ) : (
          <div className="cocina-pedidos-grid">
            {pedidosFiltrados.map((pedido) => (
              <CocinaPedidoCard
                key={pedido._id}
                pedido={pedido}
                tiempoTranscurrido={tiempos[pedido._id] || 0}
                onIniciarPreparacion={handleIniciarPreparacion}
                onMarcarListo={handleMarcarListo}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}