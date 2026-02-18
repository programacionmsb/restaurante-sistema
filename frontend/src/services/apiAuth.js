const API_URL = 'https://restaurante-backend-a6o9.onrender.com/api'

// Servicio de Autenticación
export const authAPI = {
  // Login
  login: async (usuario, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }
    
    const userData = await response.json();
    
    // Guardar en localStorage
    localStorage.setItem('usuario', JSON.stringify(userData));
    
    return userData;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('usuario');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!authAPI.getCurrentUser();
  },

  // Verificar si tiene un permiso específico
  hasPermission: (permiso) => {
    const user = authAPI.getCurrentUser();
    if (!user || !user.rol || !user.rol.permisos) return false;
    return user.rol.permisos.includes(permiso);
  },

  // Verificar si tiene alguno de varios permisos
  hasAnyPermission: (permisos) => {
    return permisos.some(permiso => authAPI.hasPermission(permiso));
  },

  // Verificar si tiene todos los permisos
  hasAllPermissions: (permisos) => {
    return permisos.every(permiso => authAPI.hasPermission(permiso));
  }
};