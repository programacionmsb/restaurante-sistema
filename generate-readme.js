#!/usr/bin/env node
/**
 * generate-readme.js
 * Ejecutar desde la raíz: node generate-readme.js
 */

const fs = require('fs');
const path = require('path');

// ========== HELPERS ==========

const existe = (ruta) => fs.existsSync(ruta);

const leerDir = (ruta) => {
  if (!existe(ruta)) return [];
  return fs.readdirSync(ruta);
};

const esDirectorio = (ruta) => {
  if (!existe(ruta)) return false;
  return fs.statSync(ruta).isDirectory();
};

const leerSubcarpetas = (ruta) => {
  return leerDir(ruta).filter(f => esDirectorio(path.join(ruta, f)));
};

const leerArchivos = (ruta, ext) => {
  return leerDir(ruta).filter(f => !esDirectorio(path.join(ruta, f)) && (!ext || f.endsWith(ext)));
};

// ========== LEER ESTRUCTURA ==========

const ROOT = __dirname;
const BACKEND_ROUTES = path.join(ROOT, 'backend', 'routes');
const BACKEND_MODELS = path.join(ROOT, 'backend', 'models');
const BACKEND_CONTROLLERS = path.join(ROOT, 'backend', 'controllers');
const BACKEND_CONFIG = path.join(ROOT, 'backend', 'config');
const FRONTEND_COMPONENTS = path.join(ROOT, 'frontend', 'src', 'components');
const FRONTEND_SERVICES = path.join(ROOT, 'frontend', 'src', 'services');

const rutas = leerArchivos(BACKEND_ROUTES, '.js').map(f => f.replace('.js', ''));
const modelos = leerArchivos(BACKEND_MODELS, '.js').map(f => f.replace('.js', ''));
const controladores = leerArchivos(BACKEND_CONTROLLERS, '.js').map(f => f.replace('.js', ''));
const configFiles = leerArchivos(BACKEND_CONFIG, '.js').map(f => f.replace('.js', ''));
const componentesRaiz = leerSubcarpetas(FRONTEND_COMPONENTS);
const services = leerArchivos(FRONTEND_SERVICES, '.js').map(f => f.replace('.js', ''));

// Leer estructura interna de cada componente
const detalleComponentes = componentesRaiz.map(comp => {
  const base = path.join(FRONTEND_COMPONENTS, comp);
  const subcarpetas = leerSubcarpetas(base);
  const archivos = leerArchivos(base, '.js');
  const hooks = subcarpetas.includes('hooks') ? leerArchivos(path.join(base, 'hooks'), '.js') : [];
  const components = subcarpetas.includes('components') ? leerArchivos(path.join(base, 'components'), '.js') : [];
  const utils = subcarpetas.includes('utils') ? leerArchivos(path.join(base, 'utils'), '.js') : [];
  return { nombre: comp, subcarpetas, archivos, hooks, components, utils };
});

// Leer package.json del frontend y backend
const pkgFrontend = JSON.parse(fs.readFileSync(path.join(ROOT, 'frontend', 'package.json'), 'utf8'));
const pkgBackend = JSON.parse(fs.readFileSync(path.join(ROOT, 'backend', 'package.json'), 'utf8'));

const depsBackend = Object.keys(pkgBackend.dependencies || {});
const depsFrontend = Object.keys(pkgFrontend.dependencies || {});

// ========== GENERAR ÁRBOL DE ESTRUCTURA ==========

const generarArbol = () => {
  let arbol = '';

  arbol += `\`\`\`\n`;
  arbol += `restaurante-sistema/\n`;
  arbol += `├── backend/\n`;
  arbol += `│   ├── config/\n`;
  configFiles.forEach(f => { arbol += `│   │   └── ${f}.js\n`; });
  arbol += `│   ├── controllers/\n`;
  controladores.forEach(f => { arbol += `│   │   └── ${f}.js\n`; });
  arbol += `│   ├── models/\n`;
  modelos.forEach(f => { arbol += `│   │   └── ${f}.js\n`; });
  arbol += `│   ├── routes/\n`;
  rutas.forEach(f => { arbol += `│   │   └── ${f}.js\n`; });
  arbol += `│   └── server.js\n`;
  arbol += `│\n`;
  arbol += `└── frontend/\n`;
  arbol += `    └── src/\n`;
  arbol += `        ├── components/\n`;

  detalleComponentes.forEach((comp, i) => {
    const esUltimo = i === detalleComponentes.length - 1;
    const prefijo = esUltimo ? '        │   └── ' : '        │   ├── ';
    const prefijoPadre = esUltimo ? '        │       ' : '        │   │   ';

    arbol += `${prefijo}${comp.nombre}/\n`;

    if (comp.subcarpetas.includes('components') && comp.components.length > 0) {
      arbol += `${prefijoPadre}├── components/\n`;
      comp.components.forEach(f => { arbol += `${prefijoPadre}│   └── ${f}\n`; });
    }
    if (comp.subcarpetas.includes('hooks') && comp.hooks.length > 0) {
      arbol += `${prefijoPadre}├── hooks/\n`;
      comp.hooks.forEach(f => { arbol += `${prefijoPadre}│   └── ${f}\n`; });
    }
    if (comp.subcarpetas.includes('utils') && comp.utils.length > 0) {
      arbol += `${prefijoPadre}└── utils/\n`;
      comp.utils.forEach(f => { arbol += `${prefijoPadre}    └── ${f}\n`; });
    }
    if (comp.archivos.length > 0) {
      comp.archivos.forEach(f => { arbol += `${prefijoPadre}└── ${f}\n`; });
    }
  });

  arbol += `        └── services/\n`;
  services.forEach(f => { arbol += `            └── ${f}.js\n`; });
  arbol += `\`\`\``;

  return arbol;
};

// ========== GENERAR SECCIÓN DE MÓDULOS ==========

const MODULO_DESCRIPCIONES = {
  Auth:         { emoji: '🔐', desc: 'Login, logout y control de sesión por roles y permisos.' },
  Pedidos:      { emoji: '🛒', desc: 'Crear, editar y eliminar pedidos. Soporte para platos sueltos y menús completos. Estados: pendiente → en_preparacion → listo → entregado.' },
  Cocina:       { emoji: '👨‍🍳', desc: 'Vista en tiempo real de pedidos pendientes y en preparación. Temporizador por pedido.' },
  Caja:         { emoji: '💰', desc: 'Cobro de pedidos listos. Integración con módulo de créditos.' },
  Clientes:     { emoji: '👥', desc: 'Gestión de clientes, historial de pedidos y actualización en tiempo real.' },
  Creditos:     { emoji: '💳', desc: 'Sistema de deudas con pago parcial/total usando FIFO. Métodos: efectivo, transferencia, Yape, Plin.' },
  Menu:         { emoji: '📅', desc: 'Vista semanal de menús. Categorías: Entradas, Platos Principales, Bebidas, Postres, Otros. Exportación a PDF y Excel por día o semana.' },
  Platos:       { emoji: '🍽️', desc: 'Gestión de platos por categoría con activar/desactivar disponibilidad.' },
  Reportes:     { emoji: '📊', desc: 'Reportes de ventas, pedidos y métricas del negocio.' },
  CierreTurno:  { emoji: '🔒', desc: 'Cierre de turno con resumen de ventas y caja.' },
  Roles:        { emoji: '🛡️', desc: 'Gestión de roles y permisos por usuario.' },
  Usuarios:     { emoji: '👤', desc: 'Administración de usuarios del sistema.' },
};

const generarModulos = () => {
  let md = '';
  detalleComponentes.forEach(comp => {
    const info = MODULO_DESCRIPCIONES[comp.nombre] || { emoji: '📁', desc: `Módulo ${comp.nombre}.` };
    md += `### ${info.emoji} ${comp.nombre}\n`;
    md += `${info.desc}\n\n`;

    if (comp.hooks.length > 0) {
      md += `**Hooks:** ${comp.hooks.map(h => `\`${h}\``).join(', ')}\n\n`;
    }
    if (comp.components.length > 0) {
      md += `**Componentes:** ${comp.components.map(c => `\`${c}\``).join(', ')}\n\n`;
    }
  });
  return md;
};

// ========== GENERAR SECCIÓN API ==========

const RUTA_DESCRIPCIONES = {
  auth:          'POST /login, POST /logout, GET /me',
  pedidos:       'GET, POST, PUT /:id, DELETE /:id, PATCH /:id/estado',
  platos:        'GET, POST, PUT /:id, DELETE /:id, PATCH /:id/toggle',
  clientes:      'GET, POST, PUT /:id, DELETE /:id',
  usuarios:      'GET, POST, PUT /:id, DELETE /:id',
  roles:         'GET, POST, PUT /:id, DELETE /:id',
  creditos:      'GET /clientes, POST /:clienteId/pagar',
  menuDia:       'GET /rango, POST, PUT /:id, DELETE /:id, PATCH /:id/toggle',
  cierresTurno:  'GET, POST, GET /:id',
};

const generarAPI = () => {
  let md = '| Ruta | Endpoints |\n|------|----------|\n';
  rutas.forEach(r => {
    const desc = RUTA_DESCRIPCIONES[r] || 'CRUD estándar';
    md += `| \`/api/${r}\` | ${desc} |\n`;
  });
  return md;
};

// ========== COMPONER README ==========

const fecha = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

const readme = `# 🍽️ RestaurantePRO - Sistema de Gestión de Restaurante

> Generado automáticamente el ${fecha} · [generate-readme.js]

Sistema completo de gestión para restaurantes con tiempo real, roles y permisos, créditos, menús semanales y control de cocina.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React ${pkgFrontend.dependencies.react?.replace('^','') || '19'} |
| Backend | Node.js + Express ${pkgBackend.dependencies.express?.replace('^','') || ''} |
| Base de datos | MongoDB + Mongoose ${pkgBackend.dependencies.mongoose?.replace('^','') || ''} |
| Tiempo real | Socket.IO ${pkgBackend.dependencies['socket.io']?.replace('^','') || ''} |
| Deploy | Render (2 servicios independientes) |
| Exportación | jsPDF + XLSX |
| Íconos | Lucide React |

---

## 📦 Módulos del Sistema (${detalleComponentes.length} módulos)

${generarModulos()}
---

## 🗂️ Estructura del Proyecto

${generarArbol()}

---

## 🔌 API REST

${generarAPI()}

---

## ⚙️ Variables de Entorno

### Backend (\`.env\`)
\`\`\`env
MONGODB_URI=mongodb+srv://...
PORT=5000
FRONTEND_URL=https://tu-frontend.onrender.com
JWT_SECRET=tu_secreto_aqui
\`\`\`

### Frontend (\`.env\`)
\`\`\`env
REACT_APP_API_URL=https://tu-backend.onrender.com
REACT_APP_SOCKET_URL=https://tu-backend.onrender.com
\`\`\`

---

## 🌐 Deploy en Render

### Backend (Web Service)
| Campo | Valor |
|-------|-------|
| Root Directory | \`backend\` |
| Build Command | \`npm install\` |
| Start Command | \`npm start\` |

### Frontend (Static Site)
| Campo | Valor |
|-------|-------|
| Root Directory | \`frontend\` |
| Build Command | \`npm install && npm run build\` |
| Publish Directory | \`frontend/build\` |

---

## 🔄 Tiempo Real - Socket.IO

| Evento | Descripción |
|--------|-------------|
| \`pedido:nuevo\` | Nuevo pedido creado |
| \`pedido:actualizado\` | Estado de pedido cambiado |
| \`pedido:eliminado\` | Pedido eliminado |
| \`credito:actualizado\` | Pago de crédito registrado |

---

## 📦 Dependencias principales

### Backend
${depsBackend.map(d => `- \`${d}\` ${pkgBackend.dependencies[d]}`).join('\n')}

### Frontend
${depsFrontend.map(d => `- \`${d}\` ${pkgFrontend.dependencies[d]}`).join('\n')}

---

## 📱 Contacto

📞 **+51 931 870 297**
`;

// ========== ESCRIBIR ARCHIVO ==========

fs.writeFileSync(path.join(ROOT, 'README.md'), readme, 'utf8');
console.log('✅ README.md generado correctamente');
console.log(`📦 Módulos detectados: ${detalleComponentes.map(c => c.nombre).join(', ')}`);
console.log(`🔌 Rutas API detectadas: ${rutas.join(', ')}`);
console.log(`📄 Modelos detectados: ${modelos.join(', ')}`);