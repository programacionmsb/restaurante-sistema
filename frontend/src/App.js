import React, { useState, useEffect } from 'react';
import { Users, Shield, LogOut, Menu as MenuIcon, UserCog, ShoppingCart, ChefHat, UtensilsCrossed, Calendar, DollarSign, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { authAPI } from './services/apiAuth';
import Login from './components/Auth/Login';
import ClientesList from './components/Clientes/ClientesList';
import RolesList from './components/Roles/RolesList';
import UsuariosList from './components/Usuarios/UsuariosList';
import PedidosList from './components/Pedidos/PedidosList';
import CocinaView from './components/Cocina/CocinaView';
import PlatosList from './components/Platos/PlatosList';
import MenuView from './components/Menu/MenuView';
import CajaView from './components/Caja/CajaView';
import ReportesView from './components/Reportes/ReportesView';
import CierreTurno from './components/CierreTurno/CierreTurno';
import CreditosView from './components/Creditos/CreditosView';  // ← NUEVO

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [vistaActual, setVistaActual] = useState('clientes');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const usuarioGuardado = authAPI.getCurrentUser();
    if (usuarioGuardado) {
      setUsuario(usuarioGuardado);
    }
  }, []);

  const handleLogin = (userData) => {
    setUsuario(userData);
  };

  const handleLogout = () => {
    if (window.confirm('¿Cerrar sesión?')) {
      authAPI.logout();
      setUsuario(null);
      setVistaActual('clientes');
    }
  };

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  const tieneAcceso = (permisos) => {
    return authAPI.hasAnyPermission(permisos);
  };

  const menuItems = [
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      permisos: ['clientes.ver'],
      component: ClientesList
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: ShoppingCart,
      permisos: ['pedidos.ver_todos', 'pedidos.ver_propios'],
      component: PedidosList
    },
    {
      id: 'cocina',
      label: 'Cocina',
      icon: ChefHat,
      permisos: ['cocina.ver'],
      component: CocinaView
    },
    {
      id: 'caja',
      label: 'Caja',
      icon: DollarSign,
      permisos: ['caja.cobrar', 'caja.ver_reportes'],
      component: CajaView
    },
    // ========== NUEVO: CRÉDITOS ========== 
    {
      id: 'creditos',
      label: 'Créditos',
      icon: CreditCard,
      permisos: ['creditos.ver_propios', 'creditos.ver_todos'],
      component: CreditosView
    },
    // ========== FIN NUEVO ========== 
    {
      id: 'cierre-turno',
      label: 'Cierre de Turno',
      icon: Clock,
      permisos: ['caja.cobrar', 'pedidos.ver_propios'],
      component: CierreTurno
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: TrendingUp,
      permisos: ['reportes.ventas'],
      component: ReportesView
    },
    {
      id: 'menu',
      label: 'Menú del Día',
      icon: Calendar,
      permisos: ['menu.ver', 'menu.crear', 'menu.editar'],
      component: MenuView
    },
    {
      id: 'platos',
      label: 'Platos',
      icon: UtensilsCrossed,
      permisos: ['platos.ver'],
      component: PlatosList
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: UserCog,
      permisos: ['usuarios.ver'],
      component: UsuariosList
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: Shield,
      permisos: ['roles.ver'],
      component: RolesList
    }
  ];

  const menuDisponible = menuItems.filter(item => tieneAcceso(item.permisos));
  const ComponenteActual = menuItems.find(item => item.id === vistaActual)?.component || ClientesList;

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <MenuIcon size={24} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                RestaurantePRO
              </h1>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>
                Sistema de Gestión Integral
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                {usuario.nombre}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                {usuario.rol?.nombre}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            marginTop: '1rem',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {menuDisponible.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setVistaActual(item.id);
                    setMenuOpen(false);
                  }}
                  style={{
                    background: vistaActual === item.id 
                      ? 'rgba(255,255,255,0.3)' 
                      : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseOut={(e) => {
                    if (vistaActual !== item.id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <main>
        <ComponenteActual />
      </main>
    </div>
  );
}