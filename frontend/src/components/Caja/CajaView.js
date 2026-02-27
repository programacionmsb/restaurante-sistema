import React, { useState } from 'react';
import { DollarSign, Download, FileText } from 'lucide-react';
import { pedidosAPI } from '../../services/apiPedidos';
import { authAPI } from '../../services/apiAuth';
import { useCaja } from './hooks/useCaja';
import { useSocketCaja } from './hooks/useSocketCaja';
import { useCreditosCaja } from './hooks/useCreditosCaja';
import { CajaResumen } from './components/CajaResumen';
import { CajaFiltros } from './components/CajaFiltros';
import { CajaPedidoCard } from './components/CajaPedidoCard';
import { CajaHistorial } from './components/CajaHistorial';
import { CajaCreditosResumen } from './components/CajaCreditosResumen';
import { ModalPago } from './components/ModalPago';
import { calcularEstadisticasCaja, getFiltroFechaLabel } from './utils/cajaHelpers';
import { exportarExcelCaja, exportarPDFCaja } from './utils/cajaExportar';
import './caja.css';

export default function CajaView() {
  const [filtroFecha, setFiltroFecha] = useState('hoy');
  const [fechaPersonalizada, setFechaPersonalizada] = useState('');
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  // Custom hooks
  const { pedidos, loading, cargarPedidos } = useCaja(filtroFecha, fechaPersonalizada);
  const { reporteCreditos, loadingCreditos, cargarCreditos } = useCreditosCaja();
  useSocketCaja(() => {
    cargarPedidos();
    cargarCreditos();
  });

  // Calcular estadísticas
  const stats = calcularEstadisticasCaja(pedidos);

  // Handlers
  const abrirModalPago = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalPagoOpen(true);
  };

  const cerrarModalPago = () => {
    setModalPagoOpen(false);
    setPedidoSeleccionado(null);
  };

  const registrarPago = async (metodoPago) => {
    try {
      const usuario = authAPI.getCurrentUser();
      await pedidosAPI.registrarPago(pedidoSeleccionado._id, metodoPago, usuario._id);
      cargarPedidos();
      cargarCreditos();
      cerrarModalPago();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleExportarExcel = () => {
    exportarExcelCaja(stats, filtroFecha, fechaPersonalizada, reporteCreditos);
  };

  const handleExportarPDF = () => {
    exportarPDFCaja(stats, filtroFecha, fechaPersonalizada, reporteCreditos);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <DollarSign size={48} className="loading-icon" />
          <h2>Cargando datos de caja...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="caja-container">
      {/* Header */}
      <header className="caja-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <DollarSign size={32} color="#10b981" />
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>Caja</h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Gestión de Pagos y Recaudación</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleExportarExcel}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Download size={20} />
              Exportar Excel
            </button>
            <button
              onClick={handleExportarPDF}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FileText size={20} />
              Exportar PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="caja-main">
        {/* Filtros */}
        <CajaFiltros 
          filtroFecha={filtroFecha}
          onCambiarFiltro={setFiltroFecha}
          fechaPersonalizada={fechaPersonalizada}
          onCambiarFecha={setFechaPersonalizada}
        />

        {/* Resumen de Caja */}
        <CajaResumen stats={stats} reporteCreditos={reporteCreditos} />

        {/* Resumen de Créditos */}
        {!loadingCreditos && <CajaCreditosResumen reporteCreditos={reporteCreditos} />}

        {/* Pedidos Por Cobrar */}
        {stats.pedidosPorCobrar.length > 0 && (
          <div className="caja-section">
            <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '1rem' }}>
              Pedidos Por Cobrar ({stats.pedidosPorCobrar.length})
            </h2>
            
            <div className="caja-pedidos-grid">
              {stats.pedidosPorCobrar.map((pedido) => (
                <CajaPedidoCard
                  key={pedido._id}
                  pedido={pedido}
                  onCobrar={abrirModalPago}
                />
              ))}
            </div>
          </div>
        )}

        {/* Historial de Pagos */}
        <div className="caja-section">
          <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '1rem' }}>
            Historial de Pagos - {getFiltroFechaLabel(filtroFecha, fechaPersonalizada)} ({stats.pedidosPagados.length})
          </h2>

          <CajaHistorial pedidosPagados={stats.pedidosPagados} />
        </div>
      </main>

      {/* Modal de Pago */}
      {modalPagoOpen && pedidoSeleccionado && (
        <ModalPago
          pedido={pedidoSeleccionado}
          onClose={cerrarModalPago}
          onPagar={registrarPago}
        />
      )}
    </div>
  );
}