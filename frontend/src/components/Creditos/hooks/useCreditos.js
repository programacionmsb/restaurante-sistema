import { useState, useEffect } from 'react';
import { creditosAPI } from '../../../services/apiCreditos';
import { authAPI } from '../../../services/apiAuth';

export const useCreditos = () => {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const usuario = authAPI.getCurrentUser();
  const permisos = usuario?.rol?.permisos || [];

  const cargarClientes = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await creditosAPI.getClientesConDeuda(usuario._id, permisos);
      
      // Convertir a array si viene como objeto
      let clientesArray = data;
      if (!Array.isArray(data)) {
        if (typeof data === 'object' && data !== null) {
          clientesArray = Object.values(data);
        }
      }
      
      setClientes(clientesArray);
    } catch (err) {
      console.error('Error cargando clientes:', err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  return {
    clientes,
    cargando,
    error,
    setError,
    cargarClientes,
    usuario,
    permisos
  };
};