import React, { useState } from 'react';
import { Users, Menu as MenuIcon, UserCog, ShoppingCart, ChefHat, UtensilsCrossed, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import ClientesList from './components/Clientes/ClientesList';
import PedidosList from './components/Pedidos/PedidosList';
import CocinaView from './components/Cocina/CocinaView';
import PlatosList from './components/Platos/PlatosList';
import MenuView from './components/Menu/MenuView';
import CajaView from './components/Caja/CajaView';
import ReportesView from './components/Reportes/ReportesView';

export default function App() {
  const [vistaActual, setVistaActual] = useState('clientes');
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { id: 'clientes', label: 'Clientes', icon: Users, component: ClientesList },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart, component: PedidosList },
    { id: 'cocina', label: 'Cocina', icon: ChefHat, component: CocinaView },
    { id: 'caja', label: 'Caja', icon: DollarSign, component: CajaView },
    { id: 'reportes', label: 'Reportes', icon: TrendingUp, component: ReportesView },
    { id: 'menu', label: 'Menú del Día', icon: Calendar, component: MenuView },
    { id: 'platos', label: 'Platos', icon: UtensilsCrossed, component: PlatosList }
  ];

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
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>RestaurantePRO</h1>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>Sistema de Gestión Integral</p>
            </div>
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
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setVistaActual(item.id); setMenuOpen(false); }}
                  style={{
                    background: vistaActual === item.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
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