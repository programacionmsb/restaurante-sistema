import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Download, DollarSign, ShoppingCart, Clock, Award, XCircle, Tag, FileText, CreditCard } from 'lucide-react';
import { pedidosAPI } from '../../services/apiPedidos';
import { creditosAPI } from '../../services/apiCreditos';
import { authAPI } from '../../services/apiAuth';
import './reportes.css';

export default function ReportesView() {
  const [pedidos, setPedidos] = useState([]);
  const [reporteCreditos, setReporteCreditos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState('hoy');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const usuario = authAPI.getCurrentUser();
  const permisos = usuario?.rol?.permisos || [];

  useEffect(() => {
    cargarDatos();
  }, [filtroFecha, fechaInicio, fechaFin]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar pedidos
      let data;
      
      if (filtroFecha === 'hoy') {
        data = await pedidosAPI.getHoy();
      } else if (filtroFecha === 'rango' && fechaInicio && fechaFin) {
        data = await pedidosAPI.getPorRango(fechaInicio, fechaFin);
      } else {
        const hoy = new Date();
        let fechaInicioCalc;
        
        if (filtroFecha === 'ayer') {
          fechaInicioCalc = new Date(hoy);
          fechaInicioCalc.setDate(hoy.getDate() - 1);
        } else if (filtroFecha === 'semana') {
          fechaInicioCalc = new Date(hoy);
          fechaInicioCalc.setDate(hoy.getDate() - 6);
        } else if (filtroFecha === 'mes') {
          fechaInicioCalc = new Date(hoy);
          fechaInicioCalc.setDate(hoy.getDate() - 29);
        }
        
        const fechaFinCalc = new Date(hoy);
        
        data = await pedidosAPI.getPorRango(
          fechaInicioCalc.toISOString().split('T')[0],
          fechaFinCalc.toISOString().split('T')[0]
        );
      }
      
      setPedidos(data);

      // Cargar reporte de créditos
      try {
        const creditosData = await creditosAPI.getReporteCreditos(usuario._id, permisos);
        setReporteCreditos(creditosData);
      } catch (err) {
        console.error('Error cargando créditos:', err);
        setReporteCreditos(null);
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pedidos no cancelados
  const pedidosActivos = pedidos.filter(p => !p.cancelado);
  const pedidosCancelados = pedidos.filter(p => p.cancelado);

  // Estadísticas generales
  const totalVentas = pedidosActivos.reduce((sum, p) => sum + p.total, 0);
  const totalDescuentos = pedidosActivos.reduce((sum, p) => sum + (p.totalDescuentos || 0), 0);
  const ventasBrutas = totalVentas + totalDescuentos;
  const ticketPromedio = pedidosActivos.length > 0 ? totalVentas / pedidosActivos.length : 0;

  // Por estado
  const pendientes = pedidosActivos.filter(p => p.estado === 'pendiente').length;
  const enPreparacion = pedidosActivos.filter(p => p.estado === 'en_preparacion').length;
  const completados = pedidosActivos.filter(p => p.estado === 'completado').length;

  // Por método de pago
  const porEfectivo = pedidosActivos.filter(p => p.estadoPago === 'pagado' && p.metodoPago === 'efectivo').reduce((sum, p) => sum + p.total, 0);
  const porYape = pedidosActivos.filter(p => p.estadoPago === 'pagado' && p.metodoPago === 'yape').reduce((sum, p) => sum + p.total, 0);
  const porTransferencia = pedidosActivos.filter(p => p.estadoPago === 'pagado' && p.metodoPago === 'transferencia').reduce((sum, p) => sum + p.total, 0);
  const porCredito = pedidosActivos.filter(p => p.estadoPago === 'credito').reduce((sum, p) => sum + p.total, 0);

  // Productos más vendidos
  const productosVendidos = {};
  pedidosActivos.forEach(pedido => {
    pedido.items.forEach(item => {
      if (!productosVendidos[item.nombre]) {
        productosVendidos[item.nombre] = {
          nombre: item.nombre,
          cantidad: 0,
          ingresos: 0
        };
      }
      productosVendidos[item.nombre].cantidad += item.cantidad;
      
      let precioItem = item.cantidad * item.precio;
      if (item.descuento && item.descuento > 0) {
        if (item.tipoDescuento === 'porcentaje') {
          precioItem = precioItem * (1 - item.descuento / 100);
        } else {
          precioItem = Math.max(0, precioItem - item.descuento);
        }
      }
      productosVendidos[item.nombre].ingresos += precioItem;
    });
  });

  const topProductosCantidad = Object.values(productosVendidos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  const topProductosIngresos = Object.values(productosVendidos)
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 10);

  // Ventas por día (para gráfico)
  const ventasPorDia = {};
  pedidosActivos.forEach(pedido => {
    const fecha = new Date(pedido.createdAt).toLocaleDateString('es-PE');
    if (!ventasPorDia[fecha]) {
      ventasPorDia[fecha] = {
        fecha,
        ventas: 0,
        pedidos: 0
      };
    }
    ventasPorDia[fecha].ventas += pedido.total;
    ventasPorDia[fecha].pedidos += 1;
  });

  const dataVentasPorDia = Object.values(ventasPorDia).sort((a, b) => {
    return new Date(a.fecha.split('/').reverse().join('-')) - new Date(b.fecha.split('/').reverse().join('-'));
  });

  // Datos para gráfico de estados
  const dataPorEstado = [
    { name: 'Pendientes', value: pendientes, color: '#ef4444' },
    { name: 'En Preparación', value: enPreparacion, color: '#f59e0b' },
    { name: 'Completados', value: completados, color: '#10b981' }
  ].filter(item => item.value > 0);

  // Datos para gráfico de métodos de pago (incluye crédito)
  const dataPorMetodo = [
    { name: 'Efectivo', value: porEfectivo, color: '#10b981' },
    { name: 'Yape', value: porYape, color: '#3b82f6' },
    { name: 'Transferencia', value: porTransferencia, color: '#8b5cf6' },
    { name: 'Crédito', value: porCredito, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // Datos para gráfico de créditos por antigüedad
  const dataCreditosAntiguedad = reporteCreditos ? [
    { name: '0-7 días', value: reporteCreditos.porAntiguedad.hasta7dias, color: '#10b981' },
    { name: '8-30 días', value: reporteCreditos.porAntiguedad.de8a30dias, color: '#f59e0b' },
    { name: '+30 días', value: reporteCreditos.porAntiguedad.mas30dias, color: '#ef4444' }
  ].filter(item => item.value > 0) : [];

  // Tiempos de preparación
  const pedidosConTiempo = pedidosActivos.filter(p => p.inicioPreparacion && p.finPreparacion);
  const tiemposPreparacion = pedidosConTiempo.map(p => {
    const inicio = new Date(p.inicioPreparacion);
    const fin = new Date(p.finPreparacion);
    return Math.floor((fin - inicio) / 1000 / 60);
  });

  const tiempoPromedioPrep = tiemposPreparacion.length > 0
    ? tiemposPreparacion.reduce((sum, t) => sum + t, 0) / tiemposPreparacion.length
    : 0;

  const tiempoMinPrep = tiemposPreparacion.length > 0 ? Math.min(...tiemposPreparacion) : 0;
  const tiempoMaxPrep = tiemposPreparacion.length > 0 ? Math.max(...tiemposPreparacion) : 0;

  const exportarExcel = () => {
    let csv = 'Fecha;Mesa;Cliente;Estado;Estado Pago;Método Pago;Total;Descuentos\n';
    
    pedidosActivos.forEach(p => {
      const fecha = new Date(p.createdAt).toLocaleString('es-PE');
      const estado = p.estado === 'pendiente' ? 'Pendiente' : 
                     p.estado === 'en_preparacion' ? 'En Preparación' : 
                     p.estado === 'completado' ? 'Completado' : p.estado;
      const estadoPago = p.estadoPago === 'pagado' ? 'Pagado' : p.estadoPago === 'credito' ? 'Crédito' : 'Por Cobrar';
      const metodoPago = p.metodoPago ? 
                         (p.metodoPago === 'efectivo' ? 'Efectivo' : 
                          p.metodoPago === 'yape' ? 'Yape' : 
                          p.metodoPago === 'transferencia' ? 'Transferencia' : p.metodoPago) 
                         : (p.estadoPago === 'credito' ? 'Crédito' : '-');
      
      csv += `${fecha};${p.mesa};${p.cliente};${estado};${estadoPago};${metodoPago};${p.total.toFixed(2)};${(p.totalDescuentos || 0).toFixed(2)}\n`;
    });

    const BOM = '\uFEFF';
    const csvConBOM = BOM + csv;

    const blob = new Blob([csvConBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    const fechaReporte = new Date().toLocaleDateString('es-PE');
    const horaReporte = new Date().toLocaleTimeString('es-PE');
    
    let contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Ventas - RestaurantePRO</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #8b5cf6;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #8b5cf6;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .kpis {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .kpi {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .kpi-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .kpi-value {
            font-size: 24px;
            font-weight: 700;
            color: #8b5cf6;
          }
          .kpi-sublabel {
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
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 RestaurantePRO</h1>
          <p><strong>Reporte de Ventas</strong></p>
          <p>Período: ${getFiltroLabel()} | Generado: ${fechaReporte} ${horaReporte}</p>
        </div>

        <div class="kpis">
          <div class="kpi">
            <div class="kpi-label">Ventas Totales</div>
            <div class="kpi-value">S/ ${totalVentas.toFixed(2)}</div>
            <div class="kpi-sublabel">${pedidosActivos.length} pedidos</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Ticket Promedio</div>
            <div class="kpi-value">S/ ${ticketPromedio.toFixed(2)}</div>
            <div class="kpi-sublabel">Por pedido</div>
          </div>
          ${reporteCreditos ? `
          <div class="kpi">
            <div class="kpi-label" style="color: #f59e0b;">Créditos por Cobrar</div>
            <div class="kpi-value" style="color: #f59e0b;">S/ ${reporteCreditos.resumen.totalDeuda.toFixed(2)}</div>
            <div class="kpi-sublabel">${reporteCreditos.resumen.cantidadClientes} clientes</div>
          </div>
          ` : ''}
        </div>

        ${reporteCreditos && reporteCreditos.resumen.totalDeuda > 0 ? `
        <div class="section">
          <h2>💳 Créditos por Cobrar</h2>
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Monto</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              ${reporteCreditos.porAntiguedad.hasta7dias > 0 ? `
              <tr>
                <td>0-7 días (reciente)</td>
                <td><strong>S/ ${reporteCreditos.porAntiguedad.hasta7dias.toFixed(2)}</strong></td>
                <td>${((reporteCreditos.porAntiguedad.hasta7dias / reporteCreditos.resumen.totalDeuda) * 100).toFixed(1)}%</td>
              </tr>
              ` : ''}
              ${reporteCreditos.porAntiguedad.de8a30dias > 0 ? `
              <tr>
                <td>8-30 días</td>
                <td><strong>S/ ${reporteCreditos.porAntiguedad.de8a30dias.toFixed(2)}</strong></td>
                <td>${((reporteCreditos.porAntiguedad.de8a30dias / reporteCreditos.resumen.totalDeuda) * 100).toFixed(1)}%</td>
              </tr>
              ` : ''}
              ${reporteCreditos.porAntiguedad.mas30dias > 0 ? `
              <tr style="background: #fee2e2;">
                <td><strong>+30 días (antiguo)</strong></td>
                <td><strong style="color: #ef4444;">S/ ${reporteCreditos.porAntiguedad.mas30dias.toFixed(2)}</strong></td>
                <td>${((reporteCreditos.porAntiguedad.mas30dias / reporteCreditos.resumen.totalDeuda) * 100).toFixed(1)}%</td>
              </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="footer">
          <p>RestaurantePRO - Sistema de Gestión Integral</p>
          <p>Este reporte fue generado automáticamente el ${fechaReporte} a las ${horaReporte}</p>
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

  const getFiltroLabel = () => {
    if (filtroFecha === 'hoy') return 'Hoy';
    if (filtroFecha === 'ayer') return 'Ayer';
    if (filtroFecha === 'semana') return 'Última Semana';
    if (filtroFecha === 'mes') return 'Último Mes';
    if (filtroFecha === 'rango' && fechaInicio && fechaFin) {
      return `${fechaInicio} - ${fechaFin}`;
    }
    return 'Seleccionar Período';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <TrendingUp size={48} className="loading-icon" />
          <h2>Generando reportes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="reportes-container">
      {/* Header */}
      <header className="reportes-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <TrendingUp size={32} color="#8b5cf6" />
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>Reportes</h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Análisis y Estadísticas</p>
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
      <main className="reportes-main">
        {/* Filtros de Fecha */}
        <div className="reportes-filtros">
          <button
            onClick={() => setFiltroFecha('hoy')}
            className={filtroFecha === 'hoy' ? 'active' : ''}
          >
            Hoy
          </button>
          <button
            onClick={() => setFiltroFecha('ayer')}
            className={filtroFecha === 'ayer' ? 'active' : ''}
          >
            Ayer
          </button>
          <button
            onClick={() => setFiltroFecha('semana')}
            className={filtroFecha === 'semana' ? 'active' : ''}
          >
            Última Semana
          </button>
          <button
            onClick={() => setFiltroFecha('mes')}
            className={filtroFecha === 'mes' ? 'active' : ''}
          >
            Último Mes
          </button>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setFiltroFecha('rango');
              }}
              style={{
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            />
            <span>-</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setFiltroFecha('rango');
              }}
              style={{
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>

        <h2 style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '1.5rem' }}>
          Reporte: {getFiltroLabel()}
        </h2>

        {/* KPIs Principales */}
        <div className="reportes-kpis">
          <div className="kpi-card" style={{ borderColor: '#8b5cf6' }}>
            <div className="kpi-icon" style={{ background: '#ede9fe' }}>
              <DollarSign size={32} color="#8b5cf6" />
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Ventas Totales</div>
              <div className="kpi-value" style={{ color: '#8b5cf6' }}>S/ {totalVentas.toFixed(2)}</div>
              <div className="kpi-sublabel">{pedidosActivos.length} pedidos</div>
            </div>
          </div>

          <div className="kpi-card" style={{ borderColor: '#10b981' }}>
            <div className="kpi-icon" style={{ background: '#d1fae5' }}>
              <TrendingUp size={32} color="#10b981" />
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Ticket Promedio</div>
              <div className="kpi-value" style={{ color: '#10b981' }}>S/ {ticketPromedio.toFixed(2)}</div>
              <div className="kpi-sublabel">Por pedido</div>
            </div>
          </div>

          <div className="kpi-card" style={{ borderColor: '#3b82f6' }}>
            <div className="kpi-icon" style={{ background: '#dbeafe' }}>
              <ShoppingCart size={32} color="#3b82f6" />
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Pedidos Completados</div>
              <div className="kpi-value" style={{ color: '#3b82f6' }}>{completados}</div>
              <div className="kpi-sublabel">{((completados / pedidosActivos.length) * 100 || 0).toFixed(1)}% del total</div>
            </div>
          </div>

          <div className="kpi-card" style={{ borderColor: '#f59e0b' }}>
            <div className="kpi-icon" style={{ background: '#fef3c7' }}>
              <Clock size={32} color="#f59e0b" />
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Tiempo Promedio</div>
              <div className="kpi-value" style={{ color: '#f59e0b' }}>{tiempoPromedioPrep.toFixed(1)} min</div>
              <div className="kpi-sublabel">De preparación</div>
            </div>
          </div>

          {reporteCreditos && reporteCreditos.resumen.totalDeuda > 0 && (
            <div className="kpi-card" style={{ borderColor: '#f59e0b' }}>
              <div className="kpi-icon" style={{ background: '#fef3c7' }}>
                <CreditCard size={32} color="#f59e0b" />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Créditos por Cobrar</div>
                <div className="kpi-value" style={{ color: '#f59e0b' }}>S/ {reporteCreditos.resumen.totalDeuda.toFixed(2)}</div>
                <div className="kpi-sublabel">{reporteCreditos.resumen.cantidadClientes} cliente{reporteCreditos.resumen.cantidadClientes !== 1 ? 's' : ''}</div>
              </div>
            </div>
          )}

          {totalDescuentos > 0 && (
            <div className="kpi-card" style={{ borderColor: '#ef4444' }}>
              <div className="kpi-icon" style={{ background: '#fee2e2' }}>
                <Tag size={32} color="#ef4444" />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Descuentos</div>
                <div className="kpi-value" style={{ color: '#ef4444' }}>S/ {totalDescuentos.toFixed(2)}</div>
                <div className="kpi-sublabel">{((totalDescuentos / ventasBrutas) * 100).toFixed(1)}% de ventas brutas</div>
              </div>
            </div>
          )}

          {pedidosCancelados.length > 0 && (
            <div className="kpi-card" style={{ borderColor: '#6b7280' }}>
              <div className="kpi-icon" style={{ background: '#f3f4f6' }}>
                <XCircle size={32} color="#6b7280" />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Cancelados</div>
                <div className="kpi-value" style={{ color: '#6b7280' }}>{pedidosCancelados.length}</div>
                <div className="kpi-sublabel">{((pedidosCancelados.length / pedidos.length) * 100).toFixed(1)}% del total</div>
              </div>
            </div>
          )}
        </div>

        {/* Gráficos */}
        <div className="reportes-graficos">
          {/* Ventas por Día */}
          {dataVentasPorDia.length > 1 && (
            <div className="grafico-card">
              <h3>Ventas por Día</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dataVentasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ventas" stroke="#8b5cf6" strokeWidth={2} name="Ventas (S/)" />
                  <Line type="monotone" dataKey="pedidos" stroke="#10b981" strokeWidth={2} name="Pedidos" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Estados de Pedidos */}
          {dataPorEstado.length > 0 && (
            <div className="grafico-card">
              <h3>Distribución por Estado</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataPorEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Métodos de Pago */}
          {dataPorMetodo.length > 0 && (
            <div className="grafico-card">
              <h3>Métodos de Pago</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataPorMetodo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Monto (S/)">
                    {dataPorMetodo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Créditos por Antigüedad */}
          {dataCreditosAntiguedad.length > 0 && (
            <div className="grafico-card">
              <h3>Créditos por Antigüedad</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataCreditosAntiguedad}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataCreditosAntiguedad.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `S/ ${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Productos */}
        <div className="reportes-productos">
          <div className="productos-card">
            <h3>
              <Award size={24} color="#f59e0b" />
              Top 10 Productos por Cantidad
            </h3>
            <div className="productos-lista">
              {topProductosCantidad.map((producto, index) => (
                <div key={index} className="producto-item">
                  <div className="producto-rank">#{index + 1}</div>
                  <div className="producto-info">
                    <div className="producto-nombre">{producto.nombre}</div>
                    <div className="producto-cantidad">{producto.cantidad} unidades</div>
                  </div>
                  <div className="producto-barra">
                    <div 
                      className="producto-barra-fill"
                      style={{ 
                        width: `${(producto.cantidad / topProductosCantidad[0].cantidad) * 100}%`,
                        background: '#f59e0b'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="productos-card">
            <h3>
              <Award size={24} color="#10b981" />
              Top 10 Productos por Ingresos
            </h3>
            <div className="productos-lista">
              {topProductosIngresos.map((producto, index) => (
                <div key={index} className="producto-item">
                  <div className="producto-rank">#{index + 1}</div>
                  <div className="producto-info">
                    <div className="producto-nombre">{producto.nombre}</div>
                    <div className="producto-ingresos">S/ {producto.ingresos.toFixed(2)}</div>
                  </div>
                  <div className="producto-barra">
                    <div 
                      className="producto-barra-fill"
                      style={{ 
                        width: `${(producto.ingresos / topProductosIngresos[0].ingresos) * 100}%`,
                        background: '#10b981'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tiempos de Preparación */}
        {pedidosConTiempo.length > 0 && (
          <div className="reportes-tiempos">
            <h3>Tiempos de Preparación</h3>
            <div className="tiempos-stats">
              <div className="tiempo-stat">
                <div className="tiempo-label">Promedio</div>
                <div className="tiempo-value">{tiempoPromedioPrep.toFixed(1)} min</div>
              </div>
              <div className="tiempo-stat">
                <div className="tiempo-label">Mínimo</div>
                <div className="tiempo-value" style={{ color: '#10b981' }}>{tiempoMinPrep} min</div>
              </div>
              <div className="tiempo-stat">
                <div className="tiempo-label">Máximo</div>
                <div className="tiempo-value" style={{ color: '#ef4444' }}>{tiempoMaxPrep} min</div>
              </div>
              <div className="tiempo-stat">
                <div className="tiempo-label">Pedidos</div>
                <div className="tiempo-value">{pedidosConTiempo.length}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}