import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { platosAPI } from '../../services/apiPlatos';
import PlatoModal from './PlatoModal';
import ProtectedAction from '../ProtectedAction';
import './platos.css';

export default function PlatosList() {
  const [platos, setPlatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlato, setEditingPlato] = useState(null);
  const [categoriaActual, setCategoriaActual] = useState('entrada');

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

  const openModal = (plato = null) => {
    setEditingPlato(plato);
    setModalOpen(true);
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

  const getCategoriaLabel = (tipo) => {
    const labels = {
      'entrada': '🥗 Entradas',
      'plato': '🍖 Platos Principales',
      'bebida': '🥤 Bebidas',
      'postre': '🍰 Postres',
      'otros': '📦 Otros'
    };
    return labels[tipo] || tipo;
  };

  const getCategoriaColor = (tipo) => {
    const colors = {
      'entrada': '#10b981',
      'plato': '#f59e0b',
      'bebida': '#3b82f6',
      'postre': '#a855f7',
      'otros': '#6b7280'
    };
    return colors[tipo] || '#6b7280';
  };

  const estadisticas = {
    total: platos.length,
    disponibles: platos.filter(p => p.disponible).length,
    noDisponibles: platos.filter(p => !p.disponible).length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <UtensilsCrossed size={48} className="loading-icon" />
          <h2>Cargando platos...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="platos-container">
      {/* Header */}
      <header className="platos-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <UtensilsCrossed size={32} color="#8b5cf6" />
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>RestaurantePRO</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Gestión de Platos del Menú</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="platos-main">
        <div className="platos-card">
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
                {getCategoriaLabel(categoriaActual)}
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                {estadisticas.total} platos · {estadisticas.disponibles} disponibles
              </p>
            </div>

            <ProtectedAction permisos={['platos.crear']}>
              <button
                onClick={() => openModal()}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Plus size={20} />
                Nuevo Plato
              </button>
            </ProtectedAction>
          </div>

          {/* Tabs de categorías - SIN MENÚ */}
          <div className="platos-tabs">
            {['entrada', 'plato', 'bebida', 'postre', 'otros'].map(tipo => (
              <button
                key={tipo}
                className={`plato-tab ${categoriaActual === tipo ? 'active' : ''}`}
                onClick={() => setCategoriaActual(tipo)}
              >
                {getCategoriaLabel(tipo)}
              </button>
            ))}
          </div>

          {/* Grid de Platos */}
          {platos.length === 0 ? (
            <div className="platos-vacio">
              <div className="platos-vacio-icono">🍽️</div>
              <h3>No hay platos en esta categoría</h3>
              <p>Agrega el primer plato usando el botón "Nuevo Plato"</p>
            </div>
          ) : (
            <div className="platos-grid">
              {platos.map((plato) => (
                <div key={plato._id} className={`plato-card ${plato.tipo}`}>
                  <span className={`plato-badge-tipo ${plato.tipo}`}>
                    {getCategoriaLabel(plato.tipo).split(' ')[1] || getCategoriaLabel(plato.tipo)}
                  </span>

                  <div className="plato-nombre">{plato.nombre}</div>
                  
                  <ProtectedAction 
                    permisos={['platos.ver_precios']}
                    fallback={<div style={{ height: '2.5rem' }}></div>}
                  >
                    <div className="plato-precio">S/ {plato.precio.toFixed(2)}</div>
                  </ProtectedAction>

                  <div className={`plato-disponibilidad ${plato.disponible ? 'disponible' : 'no-disponible'}`}>
                    {plato.disponible ? (
                      <>
                        <Eye size={16} />
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Disponible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={16} />
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>No Disponible</span>
                      </>
                    )}
                  </div>

                  <div className="plato-acciones">
                    <ProtectedAction permisos={['platos.editar']}>
                      <button
                        onClick={() => toggleDisponibilidad(plato)}
                        style={{
                          flex: 1,
                          background: plato.disponible ? '#fee2e2' : '#d1fae5',
                          color: plato.disponible ? '#991b1b' : '#065f46',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}
                      >
                        {plato.disponible ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </ProtectedAction>

                    <ProtectedAction permisos={['platos.editar']}>
                      <button
                        onClick={() => openModal(plato)}
                        style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                    </ProtectedAction>

                    <ProtectedAction permisos={['platos.eliminar']}>
                      <button
                        onClick={() => handleDelete(plato._id, plato.nombre)}
                        style={{
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </ProtectedAction>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <PlatoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          plato={editingPlato}
          onSave={cargarPlatos}
          categoriaInicial={categoriaActual}
        />
      )}
    </div>
  );
}