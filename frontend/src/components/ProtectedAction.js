import { authAPI } from '../services/apiAuth';

// Componente para proteger acciones según permisos
export default function ProtectedAction({ 
  permisos, 
  children, 
  fallback = null,
  requireAll = false // false = necesita AL MENOS uno, true = necesita TODOS
}) {
  const tienePermiso = requireAll 
    ? authAPI.hasAllPermissions(permisos)
    : authAPI.hasAnyPermission(permisos);

  if (!tienePermiso) {
    return fallback;
  }

  return children;
}

// Hook personalizado para verificar permisos
export const usePermission = (permiso) => {
  return authAPI.hasPermission(permiso);
};

export const useAnyPermission = (permisos) => {
  return authAPI.hasAnyPermission(permisos);
};

export const useAllPermissions = (permisos) => {
  return authAPI.hasAllPermissions(permisos);
};