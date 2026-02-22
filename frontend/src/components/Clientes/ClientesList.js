import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { useClientes } from './hooks/useClientes';
import { useSocketClientes } from './hooks/useSocketClientes';
import { ClientesEstadisticas } from './components/ClientesEstadisticas';
import { ClientesBuscador } from './components/ClientesBuscador';
import { ClientesTabla } from './components/ClientesTabla';
import ClienteModal from './ClienteModal';
import ProtectedAction from '../ProtectedAction';
import { filtrarClientes, obtenerEstadisticasClientes } from './utils/clientesHelpers';
import './clientes.css';

export default function ClientesList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '' });

  // Custom hooks
  const { 
    clientes, 
    loading, 
    cargarClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
  } = useClientes();
  
  useSocketClientes(cargarClientes);

  // Filtrar clientes
  const clientesFiltrados = filtrarClientes(clientes, searchTerm);
  const stats = obtenerEstadisticasClientes(clientes);

  // Handlers
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
    const result = editingCliente 
      ? await actualizarCliente(editingCliente._id, formData)
      : await crearCliente(formData);

    if (result.success) {
      setModalOpen(false);
    } else {
      alert('Error al guardar: ' + result.error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;

    const result = await eliminarCliente(id);
    if (!result.success) {
      alert('Error al eliminar: ' + result.error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Users size={48} className="loading-icon" />
          <h2>Cargando clientes...</h2>
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
        {/* Estadísticas */}
        <ClientesEstadisticas stats={stats} />

        <div className="clientes-card">
          <div className="clientes-top-bar">
            <h2 className="clientes-title">
              Clientes ({clientesFiltrados.length}{searchTerm && ` de ${clientes.length}`})
            </h2>
            
            <ProtectedAction permisos={['clientes.crear']}>
              <button className="btn-nuevo-cliente" onClick={() => openModal()}>
                <Plus size={20} />
                Nuevo Cliente
              </button>
            </ProtectedAction>
          </div>

          {/* Buscador */}
          <ClientesBuscador searchTerm={searchTerm} onSearch={setSearchTerm} />

          {/* Tabla */}
          <ClientesTabla 
            clientes={clientesFiltrados}
            onEdit={openModal}
            onDelete={handleDelete}
          />
        </div>
      </main>

      {/* Modal */}
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