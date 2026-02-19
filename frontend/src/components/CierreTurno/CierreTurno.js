import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, User, CheckCircle, AlertCircle, FileText, ArrowLeft, Download } from 'lucide-react';
import cierreTurnoAPI from '../../services/cierreTurnoAPI';
import authAPI from '../../services/authAPI';
import './CierreTurno.css';

const CierreTurno = () => {
  const [vista, setVista] = useState('menu');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [cierreActual, setCierreActual] = useState(null);
  const [tieneCierrePendiente, setTieneCierrePendiente] = useState(false);
  const [montoEntregado, setMontoEntregado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cierres, setCierres] = useState([]);
  
  const usuario = authAPI.getCurrentUser();

  useEffect(() => {
    if (usuario) {
      verificarCierrePendiente();
    }
  }, []);

  const verificarCierrePendiente = async () => {
    try {
      const resultado = await cierreTurnoAPI.verificarCierrePendiente(usuario._id);
      setTieneCierrePendiente(resultado.tieneCierrePendiente);
      if (resultado.cierre) {
        setCierreActual(resultado.cierre);
      }
    } catch (err) {
      console.error('Error verificando cierre pendiente:', err);
    }
  };

  const generarNuevoCierre = async () => {
    setCargando(true);
    setError(null);
    setExito(null);

    try {
      const cierre = await cierreTurnoAPI.generarCierre(usuario._id);
      setCierreActual(cierre);
      setTieneCierrePendiente(true);
      setExito('Cierre de turno generado exitosamente');
      setVista('entregar');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleRegistrarEntrega = async (e) => {
    e.preventDefault();
    
    if (!montoEntregado) {
      setError('Debe ingresar el monto entregado');
      return;
    }

    setCargando(true);
    setError(null);
    setExito(null);

    try {
      const datos = {
        montoEntregado: parseFloat(montoEntregado),
        supervisorId: usuario._id,
        observaciones
      };

      await cierreTurnoAPI.registrarEntrega(cierreActual._id, datos);
      setExito('Entrega registrada exitosamente');
      setTieneCierrePendiente(false);
      setCierreActual(null);
      setMontoEntregado('');
      setObservaciones('');
      
      setTimeout(() => {
        setVista('menu');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarHistorial = async () => {
    setCargando(true);
    setError(null);

    try {
      const data = await cierreTurnoAPI.getCierresPorUsuario(usuario._id, 20);
      setCierres(data);
      setVista('historial');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (monto) => {
    return `S/ ${monto.toFixed(2)}`;
  };

  const renderMenu = () => (
    <div className="cierre-menu">
      <div className="cierre-header">
        <h2>Cierre de Turno</h2>
        <p className="cierre-usuario">
          <User size={18} />
          {usuario.nombre}
        </p>
      </div>

      {error && (
        <div className="cierre-alert cierre-alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {exito && (
        <div className="cierre-alert cierre-alert-success">
          <CheckCircle size={20} />
          {exito}
        </div>
      )}

      {tieneCierrePendiente && (
        <div className="cierre-alert cierre-alert-warning">
          <AlertCircle size={20} />
          Tienes un cierre pendiente de entrega
        </div>
      )}

      <div className="cierre-opciones">
        <button 
          className="cierre-boton cierre-boton-primary"
          onClick={generarNuevoCierre}
          disabled={cargando || tieneCierrePendiente}
        >
          <FileText size={24} />
          <span>Generar Cierre de Turno</span>
          {tieneCierrePendiente && <small>Ya tienes un cierre pendiente</small>}
        </button>

        {tieneCierrePendiente && cierreActual && (
          <button 
            className="cierre-boton cierre-boton-success"
            onClick={() => setVista('entregar')}
          >
            <DollarSign size={24} />
            <span>Registrar Entrega</span>
          </button>
        )}

        <button 
          className="cierre-boton cierre-boton-secondary"
          onClick={cargarHistorial}
          disabled={cargando}
        >
          <Clock size={24} />
          <span>Ver Historial</span>
        </button>
      </div>
    </div>
  );

  const renderReporte = () => {
    if (!cierreActual) return null;

    return (
      <div className="cierre-reporte">
        <div className="cierre-header">
          <button className="cierre-btn-back" onClick={() => setVista('menu')}>
            <ArrowLeft size={20} />
          </button>
          <h2>Reporte de Cierre</h2>
        </div>

        <div className="cierre-info-card">
          <div className="cierre-info-row">
            <span>Mesero:</span>
            <strong>{cierreActual.usuario.nombre}</strong>
          </div>
          <div className="cierre-info-row">
            <span>Fecha:</span>
            <strong>{formatearFecha(cierreActual.fecha)}</strong>
          </div>
          <div className="cierre-info-row">
            <span>Turno:</span>
            <strong>
              {formatearHora(cierreActual.turno.inicio)} - {formatearHora(cierreActual.turno.fin)}
            </strong>
          </div>
        </div>

        <div className="cierre-resumen-grid">
          <div className="cierre-stat-card">
            <div className="cierre-stat-icon" style={{backgroundColor: '#667eea'}}>
              <FileText size={24} />
            </div>
            <div className="cierre-stat-content">
              <span className="cierre-stat-label">Total Pedidos</span>
              <span className="cierre-stat-value">{cierreActual.resumen.totalPedidos}</span>
            </div>
          </div>

          <div className="cierre-stat-card">
            <div className="cierre-stat-icon" style={{backgroundColor: '#10b981'}}>
              <TrendingUp size={24} />
            </div>
            <div className="cierre-stat-content">
              <span className="cierre-stat-label">Total Ventas</span>
              <span className="cierre-stat-value">{formatearMoneda(cierreActual.resumen.totalVentas)}</span>
            </div>
          </div>
        </div>

        <div className="cierre-metodos-pago">
          <h3>Desglose por Método de Pago</h3>
          
          <div className="cierre-metodo-item cierre-metodo-efectivo">
            <span>💵 Efectivo</span>
            <strong>{formatearMoneda(cierreActual.resumen.efectivo)}</strong>
          </div>

          <div className="cierre-metodo-item">
            <span>📱 Yape</span>
            <strong>{formatearMoneda(cierreActual.resumen.yape)}</strong>
          </div>

          <div className="cierre-metodo-item">
            <span>🏦 Transferencia</span>
            <strong>{formatearMoneda(cierreActual.resumen.transferencia)}</strong>
          </div>

          <div className="cierre-metodo-total">
            <span>Total a Entregar en Efectivo:</span>
            <strong className="cierre-monto-entregar">{formatearMoneda(cierreActual.resumen.efectivo)}</strong>
          </div>
        </div>

        {cierreActual.pedidos && cierreActual.pedidos.length > 0 && (
          <div className="cierre-detalle-pedidos">
            <h3>Detalle de Pedidos ({cierreActual.pedidos.length})</h3>
            <div className="cierre-pedidos-lista">
              {cierreActual.pedidos.map((pedido, idx) => (
                <div key={idx} className="cierre-pedido-item">
                  <div className="cierre-pedido-info">
                    <span className="cierre-pedido-mesa">{pedido.mesa}</span>
                    <span className="cierre-pedido-cliente">{pedido.cliente}</span>
                    <span className="cierre-pedido-hora">{pedido.hora}</span>
                  </div>
                  <div className="cierre-pedido-pago">
                    <span className={`cierre-metodo-badge cierre-metodo-${pedido.metodoPago}`}>
                      {pedido.metodoPago}
                    </span>
                    <span className="cierre-pedido-total">{formatearMoneda(pedido.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFormularioEntrega = () => (
    <div className="cierre-entregar">
      <div className="cierre-header">
        <button className="cierre-btn-back" onClick={() => setVista('menu')}>
          <ArrowLeft size={20} />
        </button>
        <h2>Registrar Entrega</h2>
      </div>

      {error && (
        <div className="cierre-alert cierre-alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {exito && (
        <div className="cierre-alert cierre-alert-success">
          <CheckCircle size={20} />
          {exito}
        </div>
      )}

      {cierreActual && (
        <>
          {renderReporte()}

          <form onSubmit={handleRegistrarEntrega} className="cierre-form-entrega">
            <div className="cierre-form-group">
              <label>Monto Entregado en Efectivo *</label>
              <div className="cierre-input-money">
                <span>S/</span>
                <input
                  type="number"
                  step="0.01"
                  value={montoEntregado}
                  onChange={(e) => setMontoEntregado(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <small>Monto esperado: {formatearMoneda(cierreActual.resumen.efectivo)}</small>
            </div>

            <div className="cierre-form-group">
              <label>Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Agregar comentarios adicionales (opcional)"
                rows="3"
              />
            </div>

            <button 
              type="submit" 
              className="cierre-btn-submit"
              disabled={cargando}
            >
              {cargando ? 'Registrando...' : 'Confirmar Entrega'}
            </button>
          </form>
        </>
      )}
    </div>
  );

  const renderHistorial = () => (
    <div className="cierre-historial">
      <div className="cierre-header">
        <button className="cierre-btn-back" onClick={() => setVista('menu')}>
          <ArrowLeft size={20} />
        </button>
        <h2>Historial de Cierres</h2>
      </div>

      {cierres.length === 0 ? (
        <div className="cierre-vacio">
          <FileText size={48} />
          <p>No hay cierres de turno registrados</p>
        </div>
      ) : (
        <div className="cierre-historial-lista">
          {cierres.map((cierre) => (
            <div key={cierre._id} className="cierre-historial-item">
              <div className="cierre-historial-header">
                <span className="cierre-historial-fecha">{formatearFecha(cierre.fecha)}</span>
                {cierre.entregado ? (
                  <span className="cierre-badge cierre-badge-success">
                    <CheckCircle size={14} />
                    Entregado
                  </span>
                ) : (
                  <span className="cierre-badge cierre-badge-warning">
                    <AlertCircle size={14} />
                    Pendiente
                  </span>
                )}
              </div>
              
              <div className="cierre-historial-stats">
                <div className="cierre-historial-stat">
                  <span>Pedidos:</span>
                  <strong>{cierre.resumen.totalPedidos}</strong>
                </div>
                <div className="cierre-historial-stat">
                  <span>Total:</span>
                  <strong>{formatearMoneda(cierre.resumen.totalVentas)}</strong>
                </div>
                <div className="cierre-historial-stat">
                  <span>Efectivo:</span>
                  <strong>{formatearMoneda(cierre.resumen.efectivo)}</strong>
                </div>
              </div>

              {cierre.entregado && cierre.diferencia !== 0 && (
                <div className={`cierre-diferencia ${cierre.diferencia > 0 ? 'positiva' : 'negativa'}`}>
                  Diferencia: {formatearMoneda(Math.abs(cierre.diferencia))}
                  {cierre.diferencia > 0 ? ' (sobrante)' : ' (faltante)'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="cierre-turno-container">
      {vista === 'menu' && renderMenu()}
      {vista === 'generar' && renderReporte()}
      {vista === 'entregar' && renderFormularioEntrega()}
      {vista === 'historial' && renderHistorial()}
    </div>
  );
};

export default CierreTurno;
