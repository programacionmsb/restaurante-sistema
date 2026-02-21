export const exportarExcelCaja = (stats, filtroFecha, fechaPersonalizada) => {
  const getFiltroLabel = () => {
    if (filtroFecha === 'hoy') return 'Hoy';
    if (filtroFecha === 'ayer') return 'Ayer';
    if (filtroFecha === 'ultimos7') return 'Últimos 7 días';
    if (filtroFecha === 'ultimos30') return 'Últimos 30 días';
    if (filtroFecha === 'personalizado' && fechaPersonalizada) {
      const date = new Date(fechaPersonalizada);
      return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return '';
  };

  let csv = 'Fecha/Hora;Mesa;Cliente;Método Pago;Total;Descuentos\n';
  
  stats.pedidosPagados.forEach(p => {
    const fecha = new Date(p.createdAt).toLocaleString('es-PE');
    const metodoPago = p.metodoPago === 'efectivo' ? 'Efectivo' : 
                       p.metodoPago === 'yape' ? 'Yape' : 
                       p.metodoPago === 'transferencia' ? 'Transferencia' : p.metodoPago;
    
    csv += `${fecha};${p.mesa};${p.cliente};${metodoPago};${p.total.toFixed(2)};${(p.totalDescuentos || 0).toFixed(2)}\n`;
  });

  csv += '\n';
  csv += 'RESUMEN DE CAJA\n';
  csv += `Período;${getFiltroLabel()}\n`;
  csv += `Total Cobrado;S/ ${stats.totalCobrado.toFixed(2)}\n`;
  csv += `Efectivo;S/ ${stats.porEfectivo.toFixed(2)}\n`;
  csv += `Yape;S/ ${stats.porYape.toFixed(2)}\n`;
  csv += `Transferencia;S/ ${stats.porTransferencia.toFixed(2)}\n`;
  csv += `Descuentos;S/ ${stats.totalDescuentos.toFixed(2)}\n`;
  csv += `Pedidos Pagados;${stats.pedidosPagados.length}\n`;
  csv += `Por Cobrar;S/ ${stats.totalPorCobrar.toFixed(2)}\n`;

  const BOM = '\uFEFF';
  const csvConBOM = BOM + csv;

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

export const exportarPDFCaja = (stats, filtroFecha, fechaPersonalizada, reporteCreditos) => {
  const getFiltroLabel = () => {
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

  const formatHora = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  const fechaReporte = new Date().toLocaleDateString('es-PE');
  const horaReporte = new Date().toLocaleTimeString('es-PE');
  
  const contenidoHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reporte de Caja - RestaurantePRO</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #10b981; padding-bottom: 20px; }
        .header h1 { color: #10b981; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 5px 0; }
        .resumen { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .resumen-card { border: 2px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
        .resumen-label { font-size: 12px; color: #6b7280; font-weight: 600; margin-bottom: 8px; }
        .resumen-value { font-size: 24px; font-weight: 700; color: #10b981; }
        .resumen-sublabel { font-size: 11px; color: #9ca3af; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #1f2937; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f9fafb; padding: 12px; text-align: left; font-size: 12px; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
        .total-row { background: #f0fdf4; font-weight: 700; }
        .metodo-efectivo { color: #059669; }
        .metodo-yape { color: #2563eb; }
        .metodo-transferencia { color: #7c3aed; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        @media print { .resumen { grid-template-columns: repeat(2, 1fr); } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 RestaurantePRO - Caja</h1>
        <p><strong>Reporte de Caja</strong></p>
        <p>Período: ${getFiltroLabel()} | Generado: ${fechaReporte} ${horaReporte}</p>
      </div>

      <div class="resumen">
        <div class="resumen-card">
          <div class="resumen-label">Total Cobrado</div>
          <div class="resumen-value">S/ ${stats.totalCobrado.toFixed(2)}</div>
          <div class="resumen-sublabel">${stats.pedidosPagados.length} pedidos pagados</div>
        </div>
        <div class="resumen-card">
          <div class="resumen-label">Por Cobrar</div>
          <div class="resumen-value" style="color: #f59e0b;">S/ ${stats.totalPorCobrar.toFixed(2)}</div>
          <div class="resumen-sublabel">${stats.pedidosPorCobrar.length} pedidos pendientes</div>
        </div>
        ${reporteCreditos && reporteCreditos.resumen.totalDeuda > 0 ? `
        <div class="resumen-card">
          <div class="resumen-label">Créditos Pendientes</div>
          <div class="resumen-value" style="color: #ef4444;">S/ ${reporteCreditos.resumen.totalDeuda.toFixed(2)}</div>
          <div class="resumen-sublabel">${reporteCreditos.resumen.cantidadClientes} clientes</div>
        </div>
        ` : `
        <div class="resumen-card">
          <div class="resumen-label">Descuentos Aplicados</div>
          <div class="resumen-value" style="color: #ef4444;">S/ ${stats.totalDescuentos.toFixed(2)}</div>
          <div class="resumen-sublabel">Cortesías y promociones</div>
        </div>
        `}
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
              <td>${stats.pedidosPagados.filter(p => p.metodoPago === 'efectivo').length}</td>
              <td><strong>S/ ${stats.porEfectivo.toFixed(2)}</strong></td>
              <td>${stats.totalCobrado > 0 ? ((stats.porEfectivo / stats.totalCobrado) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td class="metodo-yape">📱 Yape</td>
              <td>${stats.pedidosPagados.filter(p => p.metodoPago === 'yape').length}</td>
              <td><strong>S/ ${stats.porYape.toFixed(2)}</strong></td>
              <td>${stats.totalCobrado > 0 ? ((stats.porYape / stats.totalCobrado) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td class="metodo-transferencia">🏦 Transferencia</td>
              <td>${stats.pedidosPagados.filter(p => p.metodoPago === 'transferencia').length}</td>
              <td><strong>S/ ${stats.porTransferencia.toFixed(2)}</strong></td>
              <td>${stats.totalCobrado > 0 ? ((stats.porTransferencia / stats.totalCobrado) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr class="total-row">
              <td><strong>TOTAL</strong></td>
              <td><strong>${stats.pedidosPagados.length}</strong></td>
              <td><strong>S/ ${stats.totalCobrado.toFixed(2)}</strong></td>
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
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${stats.pedidosPagados.map(p => `
              <tr>
                <td>${new Date(p.createdAt).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                <td>${p.mesa}</td>
                <td>${p.cliente}</td>
                <td class="metodo-${p.metodoPago}">
                  ${p.metodoPago === 'efectivo' ? '💵 Efectivo' : 
                    p.metodoPago === 'yape' ? '📱 Yape' : 
                    '🏦 Transferencia'}
                </td>
                <td><strong>S/ ${p.total.toFixed(2)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${stats.pedidosPorCobrar.length > 0 ? `
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
            ${stats.pedidosPorCobrar.map(p => `
              <tr>
                <td>${p.mesa}</td>
                <td>${p.cliente}</td>
                <td>${formatHora(p.createdAt)}</td>
                <td><strong>S/ ${p.total.toFixed(2)}</strong></td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3"><strong>TOTAL POR COBRAR</strong></td>
              <td><strong>S/ ${stats.totalPorCobrar.toFixed(2)}</strong></td>
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