import { useState, useEffect } from 'react';
import { creditosAPI } from '../../../services/apiCreditos';
import { authAPI } from '../../../services/apiAuth';

export const useCreditosCaja = () => {
  const [reporteCreditos, setReporteCreditos] = useState(null);
  const [loadingCreditos, setLoadingCreditos] = useState(true);

  const cargarCreditos = async () => {
    setLoadingCreditos(true);
    try {
      const usuario = authAPI.getCurrentUser();
      const permisos = usuario?.rol?.permisos || [];
      const data = await creditosAPI.getReporteCreditos(usuario._id, permisos);
      setReporteCreditos(data);
    } catch (error) {
      console.error('Error cargando créditos:', error);
      setReporteCreditos(null);
    } finally {
      setLoadingCreditos(false);
    }
  };

  useEffect(() => {
    cargarCreditos();
  }, []);

  return {
    reporteCreditos,
    loadingCreditos,
    cargarCreditos
  };
};