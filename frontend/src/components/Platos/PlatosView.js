import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Search, X } from 'lucide-react';
import { usePlatos } from './hooks/usePlatos';
import { PlatosHeader } from './components/PlatosHeader';
import { PlatosTabs } from './components/PlatosTabs';
import { PlatosGrid } from './components/PlatosGrid';
import { PlatoCard } from './components/PlatoCard';
import PlatoModal from './PlatoModal';
import { CATEGORIAS, getCategoriaLabel } from './utils/platosHelpers';
import { platosAPI } from '../../services/apiPlatos';
import './platos.css';

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'disponibles', label: '✅ Disponibles' },
  { value: 'no_disponibles', label: '🚫 No disponibles' },
];

export default function PlatosView() {
  const {
    platos, loading, categoriaActual, setCategoriaActual,
    modalOpen, editingPlato, estadisticas,
    cargarPlatos, handleDelete, toggleDisponibilidad, openModal, closeModal,
  } = usePlatos();

  const [busquedaGlobal, setBusquedaGlobal] = useState('');
  const [filtroGlobal, setFiltroGlobal] = useState('todos');
  const [todosPlatos, setTodosPlatos] = useState([]);
  const [cargandoGlobal, setCargandoGlobal] = useState(false);

  const modoGlobal = busquedaGlobal || filtroGlobal !== 'todos';

  useEffect(() => {
    if (modoGlobal && todosPlatos.length === 0) {
      cargarTodosLosPlatos();
    }
  }, [busquedaGlobal, filtroGlobal]);

  const cargarTodosLosPlatos = async () => {
    setCargandoGlobal(true);
    try {
      const [entradas, platos, bebidas, postres, otros] = await Promise.all([
        platosAPI.getByTipo('entrada'),
        platosAPI.getByTipo('plato'),
        platosAPI.getByTipo('bebida'),
        platosAPI.getByTipo('postre'),
        platosAPI.getByTipo('otros'),
      ]);
      setTodosPlatos([...entradas, ...platos, ...bebidas, ...postres, ...otros]);
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoGlobal(false);
    }
  };

  const limpiarBusquedaGlobal = () => {
    setBusquedaGlobal('');
    setTodosPlatos([]);
    setFiltroGlobal('todos');
  };

  const resultadosGlobales = modoGlobal
    ? todosPlatos
        .filter(p => !busquedaGlobal || p.nombre.toLowerCase().includes(busquedaGlobal.toLowerCase()))
        .filter(p => {
          if (filtroGlobal === 'disponibles') return p.disponible;
          if (filtroGlobal === 'no_disponibles') return !p.disponible;
          return true;
        })
    : [];

  const resultadosPorCategoria = CATEGORIAS.reduce((acc, cat) => {
    const items = resultadosGlobales.filter(p => p.tipo === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  if (loading && !busquedaGlobal) {
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
      <header className="platos-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <UtensilsCrossed size={32} color="#8b5cf6" />
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>RestaurantePRO</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Gestión de Platos del Menú</p>
          </div>
        </div>
      </header>

      <main className="platos-main">
        <div className="platos-card">

          {/* Buscador Global + Filtro */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '500px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
              <input
                type="text"
                value={busquedaGlobal}
                onChange={(e) => setBusquedaGlobal(e.target.value)}
                placeholder="Buscar en todas las categorías..."
                style={{
                  width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.5rem',
                  border: '2px solid #8b5cf6', borderRadius: '0.75rem',
                  fontSize: '1rem', outline: 'none', background: '#faf5ff',
                }}
              />
              {busquedaGlobal && (
                <button onClick={limpiarBusquedaGlobal} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Filtro disponibilidad global */}
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {FILTROS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFiltroGlobal(f.value)}
                  style={{
                    padding: '0.5rem 0.875rem', border: '2px solid',
                    borderColor: filtroGlobal === f.value ? '#8b5cf6' : '#e5e7eb',
                    borderRadius: '9999px',
                    background: filtroGlobal === f.value ? '#8b5cf6' : 'white',
                    color: filtroGlobal === f.value ? 'white' : '#6b7280',
                    fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {modoGlobal ? (
            <div>
              {cargandoGlobal ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8b5cf6' }}>Buscando...</div>
              ) : resultadosGlobales.length === 0 ? (
                <div className="platos-vacio">
                  <div className="platos-vacio-icono">🔍</div>
                  <h3>Sin resultados</h3>
                  <p>Intenta con otro término o cambia el filtro de disponibilidad</p>
                </div>
              ) : (
                <>
                  <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    {resultadosGlobales.length} resultado{resultadosGlobales.length !== 1 ? 's' : ''} en todas las categorías
                  </p>
                  {Object.entries(resultadosPorCategoria).map(([cat, items]) => (
                    <div key={cat} style={{ marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#374151', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' }}>
                        {getCategoriaLabel(cat)} — {items.length} resultado{items.length !== 1 ? 's' : ''}
                      </h3>
                      <div className="platos-grid">
                        {items.map(plato => (
                          <PlatoCard
                            key={plato._id}
                            plato={plato}
                            onEditar={openModal}
                            onEliminar={handleDelete}
                            onToggleDisponibilidad={toggleDisponibilidad}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <>
              <PlatosHeader
                categoriaActual={categoriaActual}
                estadisticas={estadisticas}
                onNuevoPlato={() => openModal()}
              />
              <PlatosTabs
                categoriaActual={categoriaActual}
                onCambiarCategoria={setCategoriaActual}
              />
              <PlatosGrid
                platos={platos}
                onEditar={openModal}
                onEliminar={handleDelete}
                onToggleDisponibilidad={toggleDisponibilidad}
              />
            </>
          )}
        </div>
      </main>

      {modalOpen && (
        <PlatoModal
          isOpen={modalOpen}
          onClose={closeModal}
          plato={editingPlato}
          onSave={cargarPlatos}
          categoriaInicial={categoriaActual}
        />
      )}
    </div>
  );
}