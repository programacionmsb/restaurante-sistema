import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import ProtectedAction from '../../ProtectedAction';

export const ClientesTabla = ({ clientes, onEdit, onDelete }) => {
  if (clientes.length === 0) {
    return (
      <div className="clientes-empty">
        No se encontraron clientes
      </div>
    );
  }

  return (
    <div className="clientes-table-wrapper">
      <table className="clientes-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente._id}>
              <td className="cliente-nombre">{cliente.nombre}</td>
              <td className="cliente-info">{cliente.telefono}</td>
              <td className="cliente-info">{cliente.email || '-'}</td>
              <td>
                <div className="clientes-acciones">
                  <ProtectedAction permisos={['clientes.editar']}>
                    <button 
                      className="btn-editar"
                      onClick={() => onEdit(cliente)}
                    >
                      <Edit2 size={16} />
                    </button>
                  </ProtectedAction>

                  <ProtectedAction permisos={['clientes.eliminar']}>
                    <button 
                      className="btn-eliminar"
                      onClick={() => onDelete(cliente._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </ProtectedAction>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};