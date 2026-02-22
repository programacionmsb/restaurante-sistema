import React from 'react';
import { Users, Search, TrendingUp, ChevronRight } from 'lucide-react';
import { formatearMoneda } from '../utils/creditosHelpers';

export const CreditosListaClientes = ({ 
  clientes, 
  busqueda, 
  onBuscar, 
  onSeleccionar, 
  cargando,
  tieneVerTodos 
}) => {
  if (cargando) {
    return (
      <div className="creditos-cargando">
        <div className="spinner"></div>
        <p>Cargando clientes...</p>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="creditos-vacio">
        <Users size={64} />
        <h3>No hay clientes con deuda</h3>
        <p>{busqueda ? 'No se encontraron resultados para tu búsqueda' : 'Todos los créditos están al día'}</p>
      </div>
    );
  }

  return (
    <>
      <div className="creditos-busqueda">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar cliente por nombre o teléfono..."
          value={busqueda}
          onChange={(e) => onBuscar(e.target.value)}
        />
      </div>

      <div className="creditos-lista">
        {clientes.map((cliente, idx) => (
          <div
            key={idx}
            className="creditos-cliente-card"
            onClick={() => onSeleccionar(cliente)}
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

      <div className="creditos-resumen-global">
        <div className="creditos-stat">
          <Users size={20} />
          <div>
            <span className="creditos-stat-label">Clientes</span>
            <span className="creditos-stat-valor">{clientes.length}</span>
          </div>
        </div>
        <div className="creditos-stat">
          <TrendingUp size={20} />
          <div>
            <span className="creditos-stat-label">Total por cobrar</span>
            <span className="creditos-stat-valor">
              {formatearMoneda(clientes.reduce((sum, c) => sum + c.totalDeuda, 0))}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};