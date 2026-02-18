import React, { useState } from 'react';
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../services/apiAuth';
import './auth.css';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.usuario || !formData.password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      const userData = await authAPI.login(formData.usuario, formData.password);
      onLogin(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo y título */}
        <div className="login-header">
          <div className="login-logo">
            <LogIn size={48} />
          </div>
          <h1>RestaurantePRO</h1>
          <p>Sistema de Gestión Integral</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Usuario</label>
            <div className="input-with-icon">
              <User className="input-icon" size={20} />
              <input
                type="text"
                className="form-input"
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                placeholder="Ingrese su usuario"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Ingrese su contraseña"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Información de prueba */}
        <div className="login-footer">
          <p style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
            Usuario de prueba: <strong>admin</strong> / Contraseña: <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}