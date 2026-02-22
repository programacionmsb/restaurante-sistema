import { useState, useEffect } from 'react';
import { clientesAPI } from '../../../services/apiCliente';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    cargarClientes();
  }, []);

  const crearCliente = async (formData) => {
    try {
      await clientesAPI.create(formData);
      await cargarClientes();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const actualizarCliente = async (id, formData) => {
    try {
      await clientesAPI.update(id, formData);
      await cargarClientes();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const eliminarCliente = async (id) => {
    try {
      await clientesAPI.delete(id);
      await cargarClientes();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    clientes,
    loading,
    cargarClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
  };
};