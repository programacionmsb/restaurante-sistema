import { useState, useEffect } from 'react';
import { platosAPI } from '../../../services/apiPlatos';

export const usePlatos = () => {
  const [platos, setPlatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActual, setCategoriaActual] = useState('entrada');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlato, setEditingPlato] = useState(null);

  useEffect(() => {
    cargarPlatos();
  }, [categoriaActual]);

  const cargarPlatos = async () => {
    setLoading(true);
    try {
      const data = await platosAPI.getByTipo(categoriaActual);
      setPlatos(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar platos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await platosAPI.delete(id);
      cargarPlatos();
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleDisponibilidad = async (plato) => {
    try {
      await platosAPI.update(plato._id, { disponible: !plato.disponible });
      cargarPlatos();
    } catch (error) {
      alert(error.message);
    }
  };

  const openModal = (plato = null) => {
    setEditingPlato(plato);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPlato(null);
  };

  const estadisticas = {
    total: platos.length,
    disponibles: platos.filter(p => p.disponible).length,
    noDisponibles: platos.filter(p => !p.disponible).length,
  };

  return {
    platos,
    loading,
    categoriaActual,
    setCategoriaActual,
    modalOpen,
    editingPlato,
    estadisticas,
    cargarPlatos,
    handleDelete,
    toggleDisponibilidad,
    openModal,
    closeModal,
  };
};