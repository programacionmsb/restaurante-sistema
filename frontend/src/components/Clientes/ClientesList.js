import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { clientesAPI } from '../../services/apiCliente';
import ClienteModal from './ClienteModal';
import ProtectedAction from '../ProtectedAction'; // ← AGREGAR
import './clientes.css';

export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '' });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const data = await clientesAPI.getAll();
      setClientes(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (cliente = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({ 
        nombre: cliente.nombre, 
        telefono: cliente.telefono, 
        email: cliente.email || '' 
      });
    } else {
      setEditingCliente(null);
      setFormData({ nombre: '', telefono: '', email: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingCliente) {
        await clientesAPI.update(editingCliente._id, formData);
      } else {
        await clientesAPI.create(formData);
      }
      cargarClientes();
      setModalOpen(false);
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;

    try {
      await clientesAPI.delete(id);
      cargarClientes();
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Users size={48} className="loading-icon" />
          <h2>Cargando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="clientes-container">
      <header className="clientes-header">
        <div className="clientes-header-content">
          <Users size={32} color="#667eea" />
          <div>
            <h1>RestaurantePRO</h1>
            <p>Gestión de Clientes</p>
          </div>
        </div>
      </header>

      <main className="clientes-main">
        <div className="clientes-card">
          <div className="clientes-top-bar">
            <h2 className="clientes-title">Clientes ({clientes.length})</h2>
            
            {/* ← PROTEGER BOTÓN DE CREAR */}
            <ProtectedAction permisos={['clientes.crear']}>
              <button className="btn-nuevo-cliente" onClick={() => openModal()}>
                <Plus size={20} />
                Nuevo Cliente
              </button>
            </ProtectedAction>
          </div>

          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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
                {filteredClientes.map((cliente) => (
                  <tr key={cliente._id}>
                    <td className="cliente-nombre">{cliente.nombre}</td>
                    <td className="cliente-info">{cliente.telefono}</td>
                    <td className="cliente-info">{cliente.email || '-'}</td>
                    <td>
                      <div className="clientes-acciones">
                        {/* ← PROTEGER BOTÓN DE EDITAR */}
                        <ProtectedAction permisos={['clientes.editar']}>
                          <button 
                            className="btn-editar"
                            onClick={() => openModal(cliente)}
                          >
                            <Edit2 size={16} />
                          </button>
                        </ProtectedAction>

                        {/* ← PROTEGER BOTÓN DE ELIMINAR */}
                        <ProtectedAction permisos={['clientes.eliminar']}>
                          <button 
                            className="btn-eliminar"
                            onClick={() => handleDelete(cliente._id)}
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

            {filteredClientes.length === 0 && (
              <div className="clientes-empty">
                No se encontraron clientes
              </div>
            )}
          </div>
        </div>
      </main>

      {modalOpen && (
        <ClienteModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          cliente={editingCliente}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
        />
      )}
    </div>
  );
}