import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Smartphone, Calendar, TrendingUp, Clock, CheckCircle, XCircle, Download, FileText } from 'lucide-react';
import { pedidosAPI } from '../../services/apiPedidos';
import './caja.css';

export default function CajaView() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState('hoy');
  const [fechaPersonalizada, setFechaPersonalizada] = useState('');
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    cargarPedidos();
  }, [filtroFecha, fechaPersonalizada]);

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      let data;
      
      if (filtroFecha === 'hoy') {
        data = await pedidosAPI.getHoy();
      } else if (filtroFecha === 'personalizado' && fechaPersonalizada) {
        data = await pedidosAPI.getPorRango(fechaPersonalizada, fechaPersonalizada);
      } else {
        const hoy = new Date();
        let fechaInicio;
        
        if (filtroFecha === 'ayer') {
          fechaInicio = new Date(hoy);
          fechaInicio.setDate(hoy.getDate() - 1);
        } else if (filtroFecha === 'ultimos7') {
          fechaInicio = new Date(hoy);
          fechaInicio.setDate(hoy.getDate() - 6);
        } else if (filtroFecha === 'ultimos30') {
          fechaInicio = new Date(hoy);
          fechaInicio.setDate(hoy.getDate() - 29);
        }
        
        const fechaFin = new Date(hoy);
        
        data = await pedidosAPI.getPorRango(
          fechaInicio.toISOString().split('T')[0],
          fechaFin.toISOString().split('T')[0]
        );
      }
      
      setPedidos(data.filter(p => !p.cancelado));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

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
      await pedidosAPI.registrarPago(pedidoSeleccionado._id, metodoPago);
      cargarPedidos();
      cerrarModalPago();
    } catch (error) {
      alert(error.message);
    }
  };

  // Estadísticas
  const pedidosCompletados = pedidos.filter(p => p.estado === 'completado');
  const pedidosPorCobrar = pedidosCompletados.filter(p => p.estadoPago === 'pendiente');
  const pedidosPagados = pedidosCompletados.filter(p => p.estadoPago === 'pagado');

  const totalPorCobrar = pedidosPorCobrar.reduce((sum, p) => sum + p.total, 0);
  const totalCobrado = pedidosPagados.reduce((sum, p) => sum + p.total, 0);

  // Por método de pago - CAMBIADO: tarjeta → yape
  const porEfectivo = pedidosPagados.filter(p => p.metodoPago === 'efectivo').reduce((sum, p) => sum + p.total, 0);
  const porYape = pedidosPagados.filter(p => p.metodoPago === 'yape').reduce((sum, p) => sum + p.total, 0);
  const porTransferencia = pedidosPagados.filter(p => p.metodoPago === 'transferencia').reduce((sum, p) => sum + p.total, 0);

  // Descuentos
  const totalDescuentos = pedidosPagados.reduce((sum, p) => sum + (p.totalDescuentos || 0), 0);

  const formatHora = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  const getFiltroFechaLabel = () => {
    if (filtroFecha === 'hoy') return 'Hoy';
    if (filtroFecha === 'ayer') return 'Ayer';
    if (filtroFecha === 'ultimos7') return 'Últimos 7 días';
    if (filtroFecha === 'ultimos30') return 'Últimos 30 días';
    if (filtroFecha === 'personalizado' && fechaPersonalizada) {
      const date = new Date(fechaPersonalizada);
      return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return 'Seleccionar Fecha';
  };

  const exportarExcel = () => {
    // Crear CSV con punto y coma - CAMBIADO: tarjeta → yape
    let csv = 'Fecha/Hora;Mesa;Cliente;Método Pago;Total;Descuentos\n';
    
    pedidosPagados.forEach(p => {
      const fecha = new Date(p.createdAt).toLocaleString('es-PE');
      const metodoPago = p.metodoPago === 'efectivo' ? 'Efectivo' : 
                         p.metodoPago === 'yape' ? 'Yape' : 
                         p.metodoPago === 'transferencia' ? 'Transferencia' : p.metodoPago;
      
      csv += `${fecha};${p.mesa};${p.cliente};${metodoPago};${p.total.toFixed(2)};${(p.totalDescuentos || 0).toFixed(2)}\n`;
    });

    // Agregar resumen - CAMBIADO: tarjeta → yape
    csv += '\n';
    csv += 'RESUMEN DE CAJA\n';
    csv += `Total Cobrado;S/ ${totalCobrado.toFixed(2)}\n`;
    csv += `Efectivo;S/ ${porEfectivo.toFixed(2)}\n`;
    csv += `Yape;S/ ${porYape.toFixed(2)}\n`;
    csv += `Transferencia;S/ ${porTransferencia.toFixed(2)}\n`;
    csv += `Descuentos;S/ ${totalDescuentos.toFixed(2)}\n`;
    csv += `Pedidos Pagados;${pedidosPagados.length}\n`;
    csv += `Por Cobrar;S/ ${totalPorCobrar.toFixed(2)}\n`;

    // BOM UTF-8
    const BOM = '\uFEFF';
    const csvConBOM = BOM + csv;

    // Descargar
    const blob = new Blob([csvConBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `caja_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    const fechaReporte = new Date().toLocaleDateString('es-PE');
    const horaReporte = new Date().toLocaleTimeString('es-PE');
    
    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Caja - RestaurantePRO</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #10b981;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .resumen {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .resumen-card {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .resumen-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .resumen-value {
            font-size: 24px;
            font-weight: 700;
            color: #10b981;
          }
          .resumen-sublabel {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 5px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #1f2937;
            font-size: 18px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #f9fafb;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            color: #6b7280;
            border-bottom: 2px solid #e5e7eb;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 12px;
          }
          .total-row {
            background: #f0fdf4;
            font-weight: 700;
          }
          .metodo-efectivo { color: #059669; }
          .metodo-yape { color: #2563eb; }
          .metodo-transferencia { color: #7c3aed; }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          @media print {
            .resumen { grid-template-columns: repeat(2, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💰 RestaurantePRO - Caja</h1>
          <p><strong>Reporte de Caja</strong></p>
          <p>Período: ${getFiltroFechaLabel()} | Generado: ${fechaReporte} ${horaReporte}</p>
        </div>

        <div class="resumen">
          <div class="resumen-card">
            <div class="resumen-label">Total Cobrado</div>
            <div class="resumen-value">S/ ${totalCobrado.toFixed(2)}</div>
            <div class="resumen-sublabel">${pedidosPagados.length} pedidos pagados</div>
          </div>
          <div class="resumen-card">
            <div class="resumen-label">Por Cobrar</div>
            <div class="resumen-value" style="color: #f59e0b;">S/ ${totalPorCobrar.toFixed(2)}</div>
            <div class="resumen-sublabel">${pedidosPorCobrar.length} pedidos pendientes</div>
          </div>
          <div class="resumen-card">
            <div class="resumen-label">Descuentos Aplicados</div>
            <div class="resumen-value" style="color: #ef4444;">S/ ${totalDescuentos.toFixed(2)}</div>
            <div class="resumen-sublabel">Cortesías y promociones</div>
          </div>
        </div>

        <div class="section">
          <h2>💵 Métodos de Pago</h2>
          <table>
            <thead>
              <tr>
                <th>Método</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="metodo-efectivo">💵 Efectivo</td>
                <td>${pedidosPagados.filter(p => p.metodoPago === 'efectivo').length}</td>
                <td><strong>S/ ${porEfectivo.toFixed(2)}</strong></td>
                <td>${totalCobrado > 0 ? ((porEfectivo / totalCobrado) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td class="metodo-yape">📱 Yape</td>
                <td>${pedidosPagados.filter(p => p.metodoPago === 'yape').length}</td>
                <td><strong>S/ ${porYape.toFixed(2)}</strong></td>
                <td>${totalCobrado > 0 ? ((porYape / totalCobrado) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td class="metodo-transferencia">🏦 Transferencia</td>
                <td>${pedidosPagados.filter(p => p.metodoPago === 'transferencia').length}</td>
                <td><strong>S/ ${porTransferencia.toFixed(2)}</strong></td>
                <td>${totalCobrado > 0 ? ((porTransferencia / totalCobrado) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr class="total-row">
                <td><strong>TOTAL</strong></td>
                <td><strong>${pedidosPagados.length}</strong></td>
                <td><strong>S/ ${totalCobrado.toFixed(2)}</strong></td>
                <td><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>✅ Historial de Pagos</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Mesa</th>
                <th>Cliente</th>
                <th>Método Pago</th>
                <th>Descuento</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${pedidosPagados.map(p => `
                <tr>
                  <td>${new Date(p.createdAt).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>${p.mesa}</td>
                  <td>${p.cliente}</td>
                  <td class="metodo-${p.metodoPago}">
                    ${p.metodoPago === 'efectivo' ? '💵 Efectivo' : 
                      p.metodoPago === 'yape' ? '📱 Yape' : 
                      '🏦 Transferencia'}
                  </td>
                  <td>${(p.totalDescuentos || 0) > 0 ? `S/ ${p.totalDescuentos.toFixed(2)}` : '-'}</td>
                  <td><strong>S/ ${p.total.toFixed(2)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${pedidosPorCobrar.length > 0 ? `
        <div class="section">
          <h2>⏳ Pedidos Pendientes de Cobro</h2>
          <table>
            <thead>
              <tr>
                <th>Mesa</th>
                <th>Cliente</th>
                <th>Hora</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${pedidosPorCobrar.map(p => `
                <tr>
                  <td>${p.mesa}</td>
                  <td>${p.cliente}</td>
                  <td>${formatHora(p.createdAt)}</td>
                  <td><strong>S/ ${p.total.toFixed(2)}</strong></td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>TOTAL POR COBRAR</strong></td>
                <td><strong>S/ ${totalPorCobrar.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="footer">
          <p>RestaurantePRO - Sistema de Gestión Integral</p>
          <p>Reporte de Caja generado el ${fechaReporte} a las ${horaReporte}</p>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    ventana.document.write(contenidoHTML);
    ventana.document.close();
    
    setTimeout(() => {
      ventana.print();
    }, 500);
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
              onClick={exportarExcel}
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
              onClick={exportarPDF}
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
        {/* Filtros de Fecha */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          padding: '1rem',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setFiltroFecha('hoy')}
            style={{
              padding: '0.5rem 1rem',
              background: filtroFecha === 'hoy' ? '#10b981' : '#f3f4f6',
              color: filtroFecha === 'hoy' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Hoy
          </button>
          <button
            onClick={() => setFiltroFecha('ayer')}
            style={{
              padding: '0.5rem 1rem',
              background: filtroFecha === 'ayer' ? '#10b981' : '#f3f4f6',
              color: filtroFecha === 'ayer' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Ayer
          </button>
          <button
            onClick={() => setFiltroFecha('ultimos7')}
            style={{
              padding: '0.5rem 1rem',
              background: filtroFecha === 'ultimos7' ? '#10b981' : '#f3f4f6',
              color: filtroFecha === 'ultimos7' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Últimos 7 días
          </button>
          <button
            onClick={() => setFiltroFecha('ultimos30')}
            style={{
              padding: '0.5rem 1rem',
              background: filtroFecha === 'ultimos30' ? '#10b981' : '#f3f4f6',
              color: filtroFecha === 'ultimos30' ? 'white' : '#374151',
              border: 'none',
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
                setFiltroFecha('personalizado');
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
        </div>

        {/* Resumen de Caja */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Total Cobrado */}
          <div className="caja-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <div className="caja-card-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <CheckCircle size={32} color="white" />
            </div>
            <div className="caja-card-content">
              <div className="caja-card-label">Total Cobrado</div>
              <div className="caja-card-value">S/ {totalCobrado.toFixed(2)}</div>
              <div className="caja-card-sublabel">{pedidosPagados.length} pedidos pagados</div>
            </div>
          </div>

          {/* Por Cobrar */}
          <div className="caja-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <div className="caja-card-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Clock size={32} color="white" />
            </div>
            <div className="caja-card-content">
              <div className="caja-card-label">Por Cobrar</div>
              <div className="caja-card-value">S/ {totalPorCobrar.toFixed(2)}</div>
              <div className="caja-card-sublabel">{pedidosPorCobrar.length} pedidos pendientes</div>
            </div>
          </div>

          {/* Efectivo */}
          <div className="caja-card" style={{ background: 'white', border: '2px solid #10b981' }}>
            <div className="caja-card-icon" style={{ background: '#d1fae5' }}>
              <DollarSign size={32} color="#059669" />
            </div>
            <div className="caja-card-content" style={{ color: '#1f2937' }}>
              <div className="caja-card-label" style={{ color: '#6b7280' }}>Efectivo</div>
              <div className="caja-card-value" style={{ color: '#059669' }}>S/ {porEfectivo.toFixed(2)}</div>
              <div className="caja-card-sublabel" style={{ color: '#6b7280' }}>
                {pedidosPagados.filter(p => p.metodoPago === 'efectivo').length} pagos
              </div>
            </div>
          </div>

          {/* Yape - CAMBIADO */}
          <div className="caja-card" style={{ background: 'white', border: '2px solid #3b82f6' }}>
            <div className="caja-card-icon" style={{ background: '#dbeafe' }}>
              <Smartphone size={32} color="#2563eb" />
            </div>
            <div className="caja-card-content" style={{ color: '#1f2937' }}>
              <div className="caja-card-label" style={{ color: '#6b7280' }}>Yape</div>
              <div className="caja-card-value" style={{ color: '#2563eb' }}>S/ {porYape.toFixed(2)}</div>
              <div className="caja-card-sublabel" style={{ color: '#6b7280' }}>
                {pedidosPagados.filter(p => p.metodoPago === 'yape').length} pagos
              </div>
            </div>
          </div>

          {/* Transferencia - CAMBIADO ícono */}
          <div className="caja-card" style={{ background: 'white', border: '2px solid #8b5cf6' }}>
            <div className="caja-card-icon" style={{ background: '#ede9fe' }}>
              <CreditCard size={32} color="#7c3aed" />
            </div>
            <div className="caja-card-content" style={{ color: '#1f2937' }}>
              <div className="caja-card-label" style={{ color: '#6b7280' }}>Transferencia</div>
              <div className="caja-card-value" style={{ color: '#7c3aed' }}>S/ {porTransferencia.toFixed(2)}</div>
              <div className="caja-card-sublabel" style={{ color: '#6b7280' }}>
                {pedidosPagados.filter(p => p.metodoPago === 'transferencia').length} pagos
              </div>
            </div>
          </div>

          {/* Descuentos */}
          {totalDescuentos > 0 && (
            <div className="caja-card" style={{ background: 'white', border: '2px solid #ef4444' }}>
              <div className="caja-card-icon" style={{ background: '#fee2e2' }}>
                <TrendingUp size={32} color="#dc2626" />
              </div>
              <div className="caja-card-content" style={{ color: '#1f2937' }}>
                <div className="caja-card-label" style={{ color: '#6b7280' }}>Descuentos</div>
                <div className="caja-card-value" style={{ color: '#dc2626' }}>S/ {totalDescuentos.toFixed(2)}</div>
                <div className="caja-card-sublabel" style={{ color: '#6b7280' }}>Cortesías y promociones</div>
              </div>
            </div>
          )}
        </div>

        {/* Pedidos Por Cobrar */}
        {pedidosPorCobrar.length > 0 && (
          <div className="caja-section">
            <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '1rem' }}>
              Pedidos Por Cobrar ({pedidosPorCobrar.length})
            </h2>
            
            <div className="caja-pedidos-grid">
              {pedidosPorCobrar.map((pedido) => (
                <div key={pedido._id} className="caja-pedido-card">
                  <div className="caja-pedido-header">
                    <div>
                      <div className="caja-pedido-mesa">Mesa {pedido.mesa}</div>
                      <div className="caja-pedido-cliente">{pedido.cliente}</div>
                    </div>
                    <div className="caja-pedido-hora">{formatHora(pedido.createdAt)}</div>
                  </div>

                  <div className="caja-pedido-items">
                    {pedido.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="caja-pedido-item">
                        <span>{item.nombre}</span>
                        <span>x{item.cantidad}</span>
                      </div>
                    ))}
                    {pedido.items.length > 3 && (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>
                        +{pedido.items.length - 3} items más
                      </div>
                    )}
                  </div>

                  <div className="caja-pedido-total">
                    <span>Total:</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                      S/ {pedido.total.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => abrirModalPago(pedido)}
                    className="caja-btn-cobrar"
                  >
                    <DollarSign size={20} />
                    Cobrar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historial de Pagos */}
        <div className="caja-section">
          <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '1rem' }}>
            Historial de Pagos - {getFiltroFechaLabel()} ({pedidosPagados.length})
          </h2>

          {pedidosPagados.length === 0 ? (
            <div style={{ 
              background: 'white', 
              padding: '3rem', 
              borderRadius: '1rem', 
              textAlign: 'center',
              color: '#9ca3af',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <XCircle size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No hay pagos registrados</p>
              <p style={{ fontSize: '0.875rem' }}>Los pagos aparecerán aquí una vez cobrados</p>
            </div>
          ) : (
            <div className="caja-historial">
              {pedidosPagados.map((pedido) => (
                <div key={pedido._id} className="caja-historial-item">
                  <div className="caja-historial-info">
                    <div>
                      <span className="caja-historial-mesa">Mesa {pedido.mesa}</span>
                      <span className="caja-historial-cliente">{pedido.cliente}</span>
                    </div>
                    <div className="caja-historial-hora">{formatHora(pedido.createdAt)}</div>
                  </div>

                  <div className="caja-historial-metodo">
                    {pedido.metodoPago === 'efectivo' && <DollarSign size={16} color="#059669" />}
                    {pedido.metodoPago === 'yape' && <Smartphone size={16} color="#2563eb" />}
                    {pedido.metodoPago === 'transferencia' && <CreditCard size={16} color="#7c3aed" />}
                    <span style={{ textTransform: 'capitalize' }}>{pedido.metodoPago}</span>
                  </div>

                  <div className="caja-historial-total">S/ {pedido.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
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

// Componente Modal de Pago - CAMBIADO: tarjeta → yape
function ModalPago({ pedido, onClose, onPagar }) {
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoPagado, setMontoPagado] = useState(pedido.total);
  const [procesando, setProcesando] = useState(false);

  const cambio = montoPagado - pedido.total;

  const handlePagar = async () => {
    if (metodoPago === 'efectivo' && montoPagado < pedido.total) {
      alert('El monto pagado no puede ser menor al total');
      return;
    }

    setProcesando(true);
    try {
      await onPagar(metodoPago);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        style={{ maxWidth: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#1f2937' }}>
          Registrar Pago
        </h3>

        <div style={{ 
          background: '#f9fafb', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280' }}>Mesa:</span>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>{pedido.mesa}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280' }}>Cliente:</span>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>{pedido.cliente}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            paddingTop: '0.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <span style={{ fontWeight: '700', color: '#1f2937' }}>Total:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
              S/ {pedido.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            Método de Pago
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              onClick={() => setMetodoPago('efectivo')}
              style={{
                padding: '1rem',
                background: metodoPago === 'efectivo' ? '#10b981' : 'white',
                color: metodoPago === 'efectivo' ? 'white' : '#374151',
                border: '2px solid #10b981',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <DollarSign size={24} />
              Efectivo
            </button>
            <button
              onClick={() => setMetodoPago('yape')}
              style={{
                padding: '1rem',
                background: metodoPago === 'yape' ? '#3b82f6' : 'white',
                color: metodoPago === 'yape' ? 'white' : '#374151',
                border: '2px solid #3b82f6',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Smartphone size={24} />
              Yape
            </button>
            <button
              onClick={() => setMetodoPago('transferencia')}
              style={{
                padding: '1rem',
                background: metodoPago === 'transferencia' ? '#8b5cf6' : 'white',
                color: metodoPago === 'transferencia' ? 'white' : '#374151',
                border: '2px solid #8b5cf6',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CreditCard size={24} />
              Transfer.
            </button>
          </div>
        </div>

        {metodoPago === 'efectivo' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Monto Recibido
            </label>
            <input
              type="number"
              value={montoPagado}
              onChange={(e) => setMontoPagado(parseFloat(e.target.value) || 0)}
              step="0.01"
              min={pedido.total}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: '600'
              }}
            />
            {cambio >= 0 && (
              <div style={{ 
                marginTop: '1rem',
                padding: '1rem',
                background: cambio > 0 ? '#fef3c7' : '#d1fae5',
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '600', color: '#78350f' }}>Cambio:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: cambio > 0 ? '#92400e' : '#059669' }}>
                  S/ {cambio.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="modal-buttons">
          <button className="btn-cancelar" onClick={onClose} disabled={procesando}>
            Cancelar
          </button>
          <button 
            className="btn-guardar" 
            onClick={handlePagar}
            disabled={procesando}
          >
            {procesando ? 'Procesando...' : 'Registrar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
}