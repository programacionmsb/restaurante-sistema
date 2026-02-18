import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingCart, Percent, Tag, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import { pedidosAPI } from '../../services/apiPedidos';
import { clientesAPI } from '../../services/apiCliente';
import { platosAPI } from '../../services/apiPlatos';
import { menuAPI } from '../../services/apiMenu';
import './pedidos.css';

export default function PedidoModal({ isOpen, onClose, onSave, pedidoEditar = null }) {
  const [clientes, setClientes] = useState([]);
  const [menusDelDia, setMenusDelDia] = useState([]);
  const [platos, setPlatos] = useState({
    menu: [],
    otros: [],
    entrada: [],
    plato: [],
    bebida: [],
    postre: []
  });
  const [formData, setFormData] = useState({
    cliente: '',
    mesa: ''
  });
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [descuentoModalOpen, setDescuentoModalOpen] = useState(false);
  const [itemDescuento, setItemDescuento] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (pedidoEditar) {
      setFormData({
        cliente: pedidoEditar.cliente,
        mesa: pedidoEditar.mesa
      });

      const itemsObj = {};
      pedidoEditar.items.forEach((item, index) => {
        const tempId = `temp-${index}`;
        itemsObj[tempId] = {
          tipo: item.tipo,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
          descuento: item.descuento || 0,
          tipoDescuento: item.tipoDescuento || 'porcentaje',
          motivoDescuento: item.motivoDescuento || '',
          usuarioDescuento: item.usuarioDescuento || '',
          observaciones: item.observaciones || ''
        };
      });
      setItems(itemsObj);
    }
  }, [pedidoEditar]);

  const cargarDatos = async () => {
    try {
      const [
        clientesData, 
        menusData, 
        otrosData, 
        entradasData, 
        platosData, 
        bebidasData, 
        postresData,
        menusDelDiaData
      ] = await Promise.all([
        clientesAPI.getAll(),
        platosAPI.getByTipo('menu'),
        platosAPI.getByTipo('otros'),
        platosAPI.getByTipo('entrada'),
        platosAPI.getByTipo('plato'),
        platosAPI.getByTipo('bebida'),
        platosAPI.getByTipo('postre'),
        menuAPI.getHoy()
      ]);

      setClientes(clientesData);
      setMenusDelDia(menusDelDiaData.filter(m => m.activo));
      setPlatos({
        menu: menusData.filter(p => p.disponible),
        otros: otrosData.filter(p => p.disponible),
        entrada: entradasData.filter(p => p.disponible),
        plato: platosData.filter(p => p.disponible),
        bebida: bebidasData.filter(p => p.disponible),
        postre: postresData.filter(p => p.disponible)
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCantidadChange = (platoId, tipo, nombre, precio, delta) => {
    setItems(prev => {
      const nuevaCantidad = (prev[platoId]?.cantidad || 0) + delta;
      
      if (nuevaCantidad <= 0) {
        const { [platoId]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [platoId]: {
          tipo,
          nombre,
          cantidad: nuevaCantidad,
          precio,
          descuento: prev[platoId]?.descuento || 0,
          tipoDescuento: prev[platoId]?.tipoDescuento || 'porcentaje',
          motivoDescuento: prev[platoId]?.motivoDescuento || '',
          usuarioDescuento: prev[platoId]?.usuarioDescuento || '',
          observaciones: prev[platoId]?.observaciones || ''
        }
      };
    });
  };

  const agregarMenuCompleto = (menu) => {
    const precioMenuCompleto = menu.precioCompleto || 0;
    const menuId = `menu-completo-${menu._id}`;
    
    if (precioMenuCompleto > 0) {
      setItems(prev => ({
        ...prev,
        [menuId]: {
          tipo: 'menu',
          nombre: `${menu.nombre} (Menú Completo)`,
          cantidad: (prev[menuId]?.cantidad || 0) + 1,
          precio: precioMenuCompleto,
          descuento: 0,
          tipoDescuento: 'porcentaje',
          motivoDescuento: '',
          usuarioDescuento: '',
          observaciones: prev[menuId]?.observaciones || ''
        }
      }));
    } else {
      menu.categorias.forEach(categoria => {
        categoria.platos.forEach(plato => {
          if (plato.disponible) {
            handleCantidadChange(
              plato.platoId._id,
              categoria.nombre.toLowerCase(),
              plato.nombre,
              plato.precio,
              1
            );
          }
        });
      });
    }
  };

  const handleObservacionChange = (itemId, observaciones) => {
    setItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        observaciones
      }
    }));
  };

  const abrirModalDescuento = (itemId) => {
    setItemDescuento(itemId);
    setDescuentoModalOpen(true);
  };

  const aplicarDescuento = (tipo, valor, motivo) => {
    if (itemDescuento) {
      const usuarioActual = localStorage.getItem('usuario') || 'Usuario';
      
      setItems(prev => ({
        ...prev,
        [itemDescuento]: {
          ...prev[itemDescuento],
          descuento: parseFloat(valor) || 0,
          tipoDescuento: tipo,
          motivoDescuento: motivo,
          usuarioDescuento: usuarioActual
        }
      }));
    }
    setDescuentoModalOpen(false);
    setItemDescuento(null);
  };

  const calcularPrecioConDescuento = (item) => {
    const precioBase = item.cantidad * item.precio;
    if (!item.descuento || item.descuento === 0) return precioBase;

    if (item.tipoDescuento === 'porcentaje') {
      return precioBase * (1 - item.descuento / 100);
    } else {
      return Math.max(0, precioBase - item.descuento);
    }
  };

  const calcularDescuentoTotal = () => {
    return Object.values(items).reduce((sum, item) => {
      const precioOriginal = item.cantidad * item.precio;
      const precioFinal = calcularPrecioConDescuento(item);
      return sum + (precioOriginal - precioFinal);
    }, 0);
  };

  const calcularTotal = () => {
    return Object.values(items).reduce((sum, item) => {
      return sum + calcularPrecioConDescuento(item);
    }, 0);
  };

  // Obtener usuario actual para agregar como creador
const usuarioActual = localStorage.getItem('usuario');
let usuarioCreador = null;

if (usuarioActual) {
  try {
    const user = JSON.parse(usuarioActual);
    usuarioCreador = {
      _id: user._id,
      nombre: user.nombre,
      usuario: user.usuario
    };
  } catch (e) {
    console.error('Error al obtener usuario:', e);
  }
}

const pedidoData = {
  cliente: formData.cliente,
  mesa: formData.mesa,
  items: itemsArray,
  total: calcularTotal(),
  totalDescuentos: calcularDescuentoTotal(),
  hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
  usuarioCreador: usuarioCreador // ← AGREGADO
};

  if (!isOpen) return null;

  const total = calcularTotal();
  const totalDescuentos = calcularDescuentoTotal();
  const subtotal = total + totalDescuentos;
  const itemsArray = Object.entries(items);
  const esEdicion = !!pedidoEditar;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className="modal-content"
          style={{ maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
              {esEdicion ? 'Editar Pedido' : 'Nuevo Pedido'}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                color: '#6b7280'
              }}
            >
              <X size={24} />
            </button>
          </div>

          {esEdicion && (
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              color: '#1e40af',
              fontWeight: '600'
            }}>
              ℹ️ Editando pedido pendiente - Solo se pueden editar pedidos que aún no han iniciado preparación
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Cargando datos...
            </div>
          ) : (
            <>
              {/* Información básica */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem',
                marginBottom: '2rem',
                padding: '1.5rem',
                background: '#f9fafb',
                borderRadius: '0.75rem'
              }}>
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <select
                    className="form-input"
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  >
                    <option value="">-- Seleccionar Cliente --</option>
                    {clientes.map(c => (
                      <option key={c._id} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mesa *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.mesa}
                    onChange={(e) => setFormData({ ...formData, mesa: e.target.value })}
                    placeholder="Ej: 5"
                  />
                </div>
              </div>

              {/* Grid principal: Platos | Resumen */}
              <div className="crear-pedido-grid">
                {/* Sección de platos */}
                <div className="platos-section">
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.125rem' }}>
                    Seleccionar Items
                  </h4>

                  {/* MENÚS DEL DÍA */}
                  {menusDelDia.length > 0 && (
                    <div className="platos-categoria" style={{ 
                      border: '2px solid #ec4899',
                      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)'
                    }}>
                      <h4 style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        color: '#831843'
                      }}>
                        <span style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#ec4899', display: 'inline-block' }}></span>
                        <CalendarIcon size={16} />
                        Menú del Día
                      </h4>
                      
                      {menusDelDia.map(menu => {
                        const menuId = `menu-completo-${menu._id}`;
                        const precioMenu = menu.precioCompleto > 0 ? menu.precioCompleto : menu.categorias.reduce((sum, cat) => sum + cat.platos.reduce((s, p) => s + p.precio, 0), 0);
                        
                        return (
                          <div key={menu._id} className="plato-item" style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '0.75rem',
                            border: '1px solid #fbcfe8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div className="plato-info" style={{ flex: 1 }}>
                              <div className="plato-nombre" style={{ 
                                fontWeight: '700', 
                                color: '#831843',
                                fontSize: '1rem'
                              }}>
                                {menu.nombre}
                              </div>
                              {menu.descripcion && (
                                <div style={{ fontSize: '0.75rem', color: '#9f1239', marginTop: '0.25rem' }}>
                                  {menu.descripcion}
                                </div>
                              )}
                              <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                {menu.categorias.map((cat, idx) => (
                                  <div key={idx} style={{ marginBottom: '0.15rem' }}>
                                    <strong>{cat.nombre}:</strong> {cat.platos.map(p => p.nombre).join(', ')}
                                  </div>
                                ))}
                              </div>
                              <div className="plato-precio" style={{ 
                                fontSize: '0.875rem', 
                                fontWeight: '700', 
                                color: '#10b981',
                                marginTop: '0.5rem'
                              }}>
                                S/ {precioMenu.toFixed(2)} {menu.precioCompleto > 0 && '(Menú Completo)'}
                              </div>
                            </div>
                            
                            <div className="plato-cantidad">
                              <button 
                                className="btn-cantidad"
                                onClick={() => {
                                  setItems(prev => {
                                    const cantidad = prev[menuId]?.cantidad || 0;
                                    if (cantidad <= 1) {
                                      const { [menuId]: removed, ...rest } = prev;
                                      return rest;
                                    }
                                    return {
                                      ...prev,
                                      [menuId]: {
                                        tipo: 'menu',
                                        nombre: `${menu.nombre} (Menú Completo)`,
                                        cantidad: cantidad - 1,
                                        precio: precioMenu,
                                        descuento: 0,
                                        tipoDescuento: 'porcentaje',
                                        motivoDescuento: '',
                                        usuarioDescuento: '',
                                        observaciones: prev[menuId]?.observaciones || ''
                                      }
                                    };
                                  });
                                }}
                              >
                                <Minus size={16} />
                              </button>
                              <div className="cantidad-display">{items[menuId]?.cantidad || 0}</div>
                              <button 
                                className="btn-cantidad"
                                onClick={() => agregarMenuCompleto(menu)}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Categorías regulares */}
                  {[
                    { key: 'otros', nombre: 'Otros', color: '#6b7280' },
                    { key: 'entrada', nombre: 'Entradas', color: '#10b981' },
                    { key: 'plato', nombre: 'Platos Principales', color: '#f59e0b' },
                    { key: 'bebida', nombre: 'Bebidas', color: '#3b82f6' },
                    { key: 'postre', nombre: 'Postres', color: '#a855f7' }
                  ].map(categoria => (
                    <div key={categoria.key} className="platos-categoria">
                      <h4>
                        <span style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: categoria.color, display: 'inline-block' }}></span>
                        {categoria.nombre}
                      </h4>
                      {platos[categoria.key].map(plato => (
                        <div key={plato._id} className="plato-item">
                          <div className="plato-info">
                            <div className="plato-nombre">{plato.nombre}</div>
                            <div className="plato-precio">S/ {plato.precio.toFixed(2)}</div>
                          </div>
                          <div className="plato-cantidad">
                            <button 
                              className="btn-cantidad"
                              onClick={() => handleCantidadChange(plato._id, categoria.key, plato.nombre, plato.precio, -1)}
                            >
                              <Minus size={16} />
                            </button>
                            <div className="cantidad-display">{items[plato._id]?.cantidad || 0}</div>
                            <button 
                              className="btn-cantidad"
                              onClick={() => handleCantidadChange(plato._id, categoria.key, plato.nombre, plato.precio, 1)}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {platos[categoria.key].length === 0 && (
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>
                          No hay {categoria.nombre.toLowerCase()} disponibles
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Resumen del pedido */}
                <div className="resumen-pedido">
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingCart size={20} />
                    Resumen del Pedido
                  </h4>

                  {itemsArray.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '3rem 1rem', 
                      color: '#9ca3af',
                      background: '#f9fafb',
                      borderRadius: '0.5rem'
                    }}>
                      <ShoppingCart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>No hay items agregados</p>
                      <p style={{ fontSize: '0.875rem' }}>Selecciona platos del menú</p>
                    </div>
                  ) : (
                    <>
                      <div className="resumen-items">
                        {itemsArray.map(([id, item]) => {
                          const precioOriginal = item.cantidad * item.precio;
                          const precioFinal = calcularPrecioConDescuento(item);
                          const tieneDescuento = item.descuento && item.descuento > 0;

                          return (
                            <div key={id} className="resumen-item" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <div className="resumen-item-info">
                                  <div className="resumen-item-nombre">{item.nombre}</div>
                                  <div className="resumen-item-detalle">
                                    {item.cantidad} x S/ {item.precio.toFixed(2)}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                  {tieneDescuento && (
                                    <span style={{ 
                                      textDecoration: 'line-through', 
                                      fontSize: '0.875rem', 
                                      color: '#9ca3af' 
                                    }}>
                                      S/ {precioOriginal.toFixed(2)}
                                    </span>
                                  )}
                                  <span style={{ fontWeight: '700', color: tieneDescuento ? '#10b981' : '#1f2937' }}>
                                    S/ {precioFinal.toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              {tieneDescuento && (
                                <div style={{
                                  background: '#d1fae5',
                                  padding: '0.5rem',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.75rem',
                                  color: '#065f46'
                                }}>
                                  <Tag size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                  {item.tipoDescuento === 'porcentaje' 
                                    ? `${item.descuento}% desc.` 
                                    : `S/ ${item.descuento.toFixed(2)} desc.`}
                                  {item.motivoDescuento && ` - ${item.motivoDescuento}`}
                                </div>
                              )}

                              <button
                                onClick={() => abrirModalDescuento(id)}
                                style={{
                                  background: tieneDescuento ? '#fef3c7' : '#f3f4f6',
                                  color: tieneDescuento ? '#92400e' : '#374151',
                                  border: 'none',
                                  padding: '0.5rem',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                <Percent size={12} />
                                {tieneDescuento ? 'Modificar Descuento' : 'Aplicar Descuento'}
                              </button>

                              {/* CAMPO DE OBSERVACIONES */}
                              <div style={{ marginTop: '0.5rem' }}>
                                <label style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.25rem',
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  marginBottom: '0.25rem',
                                  fontWeight: '600'
                                }}>
                                  <MessageSquare size={12} />
                                  Observaciones:
                                </label>
                                <textarea
                                  value={item.observaciones || ''}
                                  onChange={(e) => handleObservacionChange(id, e.target.value)}
                                  placeholder="Ej: Sin cebolla, punto medio..."
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="resumen-total">
                        <div className="resumen-total-linea">
                          <span>Subtotal:</span>
                          <span>S/ {subtotal.toFixed(2)}</span>
                        </div>
                        {totalDescuentos > 0 && (
                          <div className="resumen-total-linea" style={{ color: '#10b981', fontWeight: '600' }}>
                            <span>Descuentos:</span>
                            <span>- S/ {totalDescuentos.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="resumen-total-linea">
                          <span>Items:</span>
                          <span>{itemsArray.reduce((sum, [, item]) => sum + item.cantidad, 0)}</span>
                        </div>
                        <div className="resumen-total-final">
                          <span>TOTAL:</span>
                          <span>S/ {total.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="modal-buttons" style={{ marginTop: '2rem' }}>
                <button className="btn-cancelar" onClick={onClose}>
                  Cancelar
                </button>
                <button 
                  className="btn-guardar" 
                  onClick={handleGuardarPedido}
                  disabled={itemsArray.length === 0}
                  style={{ opacity: itemsArray.length === 0 ? 0.5 : 1 }}
                >
                  {esEdicion ? 'Actualizar' : 'Crear'} Pedido (S/ {total.toFixed(2)})
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Descuento */}
      {descuentoModalOpen && (
        <ModalDescuento
          item={items[itemDescuento]}
          onClose={() => {
            setDescuentoModalOpen(false);
            setItemDescuento(null);
          }}
          onAplicar={aplicarDescuento}
        />
      )}
    </>
  );
}

// Componente Modal de Descuento
function ModalDescuento({ item, onClose, onAplicar }) {
  const [tipo, setTipo] = useState(item?.tipoDescuento || 'porcentaje');
  const [valor, setValor] = useState(item?.descuento || 0);
  const [motivo, setMotivo] = useState(item?.motivoDescuento || '');

  const motivosPredef = [
    'Cortesía',
    'Promoción',
    'Compensación',
    'Cliente frecuente',
    'Error en pedido',
    'Otro'
  ];

  const precioOriginal = item ? item.cantidad * item.precio : 0;
  
  const calcularDescuento = () => {
    if (tipo === 'porcentaje') {
      return precioOriginal * (valor / 100);
    } else {
      return Math.min(valor, precioOriginal);
    }
  };

  const precioFinal = precioOriginal - calcularDescuento();

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1001 }}>
      <div 
        className="modal-content"
        style={{ maxWidth: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>
            Aplicar Descuento
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>{item?.nombre}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {item?.cantidad} x S/ {item?.precio.toFixed(2)} = S/ {precioOriginal.toFixed(2)}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Tipo de Descuento</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              onClick={() => setTipo('porcentaje')}
              style={{
                padding: '0.75rem',
                background: tipo === 'porcentaje' ? '#8b5cf6' : '#f3f4f6',
                color: tipo === 'porcentaje' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Porcentaje (%)
            </button>
            <button
              onClick={() => setTipo('monto')}
              style={{
                padding: '0.75rem',
                background: tipo === 'monto' ? '#8b5cf6' : '#f3f4f6',
                color: tipo === 'monto' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Monto (S/)
            </button>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            {tipo === 'porcentaje' ? 'Porcentaje de Descuento' : 'Monto de Descuento'}
          </label>
          <input
            type="number"
            className="form-input"
            value={valor}
            onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
            placeholder={tipo === 'porcentaje' ? '0-100' : '0.00'}
            min="0"
            max={tipo === 'porcentaje' ? '100' : precioOriginal}
            step={tipo === 'porcentaje' ? '1' : '0.01'}
          />
          <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {tipo === 'porcentaje' ? (
              <>
                <button onClick={() => setValor(10)} style={{ padding: '0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>10%</button>
                <button onClick={() => setValor(25)} style={{ padding: '0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>25%</button>
                <button onClick={() => setValor(50)} style={{ padding: '0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>50%</button>
                <button onClick={() => setValor(100)} style={{ padding: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>100%</button>
              </>
            ) : (
              <>
                <button onClick={() => setValor(5)} style={{ padding: '0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>S/ 5</button>
                <button onClick={() => setValor(10)} style={{ padding: '0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>S/ 10</button>
                <button onClick={() => setValor(20)} style={{ padding: '0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>S/ 20</button>
                <button onClick={() => setValor(precioOriginal)} style={{ padding: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>Todo</button>
              </>
            )}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Motivo del Descuento *</label>
          <select
            className="form-input"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          >
            <option value="">-- Seleccionar Motivo --</option>
            {motivosPredef.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#78350f' }}>Precio original:</span>
            <span style={{ fontWeight: '600', color: '#78350f' }}>S/ {precioOriginal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#78350f' }}>Descuento:</span>
            <span style={{ fontWeight: '600', color: '#ef4444' }}>- S/ {calcularDescuento().toFixed(2)}</span>
          </div>
          <div style={{ borderTop: '1px solid #fcd34d', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700', color: '#78350f' }}>Precio final:</span>
            <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#10b981' }}>S/ {precioFinal.toFixed(2)}</span>
          </div>
        </div>

        <div className="modal-buttons">
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-guardar" 
            onClick={() => {
              if (!motivo) {
                alert('Debe seleccionar un motivo para el descuento');
                return;
              }
              onAplicar(tipo, valor, motivo);
            }}
          >
            Aplicar Descuento
          </button>
        </div>
      </div>
    </div>
  );
}