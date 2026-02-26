# 🍽️ RestaurantePRO - Sistema de Gestión de Restaurante

> Generado automáticamente el 26/02/2026 · [generate-readme.js]

Sistema completo de gestión para restaurantes con tiempo real, roles y permisos, créditos, menús semanales y control de cocina.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19.2.4 |
| Backend | Node.js + Express 4.18.2 |
| Base de datos | MongoDB + Mongoose 7.0.0 |
| Tiempo real | Socket.IO 4.6.0 |
| Deploy | Render (2 servicios independientes) |
| Exportación | jsPDF + XLSX |
| Íconos | Lucide React |

---

## 📦 Módulos del Sistema (12 módulos)

### 🔐 Auth
Login, logout y control de sesión por roles y permisos.

### 💰 Caja
Cobro de pedidos listos. Integración con módulo de créditos.

**Hooks:** `useCaja.js`, `useCreditosCaja.js`, `useSocketCaja.js`

**Componentes:** `CajaCreditosResumen.js`, `CajaFiltros.js`, `CajaHistorial.js`, `CajaPedidoCard.js`, `CajaResumen.js`, `ModalPago.js`

### 🔒 CierreTurno
Cierre de turno con resumen de ventas y caja.

### 👥 Clientes
Gestión de clientes, historial de pedidos y actualización en tiempo real.

**Hooks:** `useClientes.js`, `useSocketClientes.js`

**Componentes:** `ClientesBuscador.js`, `ClientesEstadisticas.js`, `ClientesTabla.js`

### 👨‍🍳 Cocina
Vista en tiempo real de pedidos pendientes y en preparación. Temporizador por pedido.

**Hooks:** `useCocina.js`, `useSocketCocina.js`

**Componentes:** `CocinaEstadisticas.js`, `CocinaFiltros.js`, `CocinaPedidoCard.js`

### 💳 Creditos
Sistema de deudas con pago parcial/total usando FIFO. Métodos: efectivo, transferencia, Yape, Plin.

**Hooks:** `useClienteDetalle.js`, `useCreditos.js`, `usePagoCredito.js`, `useSocketCreditos.js`

**Componentes:** `CreditosDetalleCliente.js`, `CreditosListaClientes.js`, `CreditosModalPago.js`

### 📅 Menu
Vista semanal de menús. Categorías: Entradas, Platos Principales, Bebidas, Postres, Otros. Exportación a PDF y Excel por día o semana.

**Hooks:** `useMenu.js`, `useMenuExport.js`, `useMenuForm.js`

**Componentes:** `MenuCategoriaEditor.js`, `MenuDiaCard.js`, `MenuFormulario.js`, `MenuSemanaGrid.js`

### 🛒 Pedidos
Crear, editar y eliminar pedidos. Soporte para platos sueltos y menús completos. Estados: pendiente → en_preparacion → listo → entregado.

**Hooks:** `usePedidos.js`, `useSocketPedidos.js`

**Componentes:** `PedidoCard.js`, `PedidosEstadisticas.js`, `PedidosFiltros.js`

### 🍽️ Platos
Gestión de platos por categoría con activar/desactivar disponibilidad.

### 📊 Reportes
Reportes de ventas, pedidos y métricas del negocio.

### 🛡️ Roles
Gestión de roles y permisos por usuario.

### 👤 Usuarios
Administración de usuarios del sistema.


---

## 🗂️ Estructura del Proyecto

```
restaurante-sistema/
├── backend/
│   ├── config/
│   │   └── cors.js
│   │   └── database.js
│   │   └── permisos.js
│   │   └── socketio.js
│   ├── controllers/
│   │   └── authController.js
│   │   └── cierreTurnoController.js
│   │   └── clientesController.js
│   │   └── creditosController.js
│   │   └── menuDiaController.js
│   │   └── pedidosController.js
│   │   └── platosController.js
│   │   └── rolesController.js
│   │   └── usuariosController.js
│   ├── models/
│   │   └── CierreTurno.js
│   │   └── Cliente.js
│   │   └── MenuDia.js
│   │   └── Pedido.js
│   │   └── Plato.js
│   │   └── Rol.js
│   │   └── Usuario.js
│   ├── routes/
│   │   └── auth.js
│   │   └── cierresTurno.js
│   │   └── clientes.js
│   │   └── creditos.js
│   │   └── menuDia.js
│   │   └── pedidos.js
│   │   └── platos.js
│   │   └── roles.js
│   │   └── usuarios.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Auth/
        │   │   └── Login.js
        │   ├── Caja/
        │   │   ├── components/
        │   │   │   └── CajaCreditosResumen.js
        │   │   │   └── CajaFiltros.js
        │   │   │   └── CajaHistorial.js
        │   │   │   └── CajaPedidoCard.js
        │   │   │   └── CajaResumen.js
        │   │   │   └── ModalPago.js
        │   │   ├── hooks/
        │   │   │   └── useCaja.js
        │   │   │   └── useCreditosCaja.js
        │   │   │   └── useSocketCaja.js
        │   │   └── utils/
        │   │       └── cajaExportar.js
        │   │       └── cajaHelpers.js
        │   │   └── CajaView.js
        │   ├── CierreTurno/
        │   │   └── CierreTurno.js
        │   ├── Clientes/
        │   │   ├── components/
        │   │   │   └── ClientesBuscador.js
        │   │   │   └── ClientesEstadisticas.js
        │   │   │   └── ClientesTabla.js
        │   │   ├── hooks/
        │   │   │   └── useClientes.js
        │   │   │   └── useSocketClientes.js
        │   │   └── utils/
        │   │       └── clientesHelpers.js
        │   │   └── ClienteModal.js
        │   │   └── ClientesList.js
        │   ├── Cocina/
        │   │   ├── components/
        │   │   │   └── CocinaEstadisticas.js
        │   │   │   └── CocinaFiltros.js
        │   │   │   └── CocinaPedidoCard.js
        │   │   ├── hooks/
        │   │   │   └── useCocina.js
        │   │   │   └── useSocketCocina.js
        │   │   └── utils/
        │   │       └── cocinaHelpers.js
        │   │   └── CocinaView.js
        │   ├── Creditos/
        │   │   ├── components/
        │   │   │   └── CreditosDetalleCliente.js
        │   │   │   └── CreditosListaClientes.js
        │   │   │   └── CreditosModalPago.js
        │   │   ├── hooks/
        │   │   │   └── useClienteDetalle.js
        │   │   │   └── useCreditos.js
        │   │   │   └── usePagoCredito.js
        │   │   │   └── useSocketCreditos.js
        │   │   └── utils/
        │   │       └── creditosHelpers.js
        │   │   └── CreditosView.js
        │   ├── Menu/
        │   │   ├── components/
        │   │   │   └── MenuCategoriaEditor.js
        │   │   │   └── MenuDiaCard.js
        │   │   │   └── MenuFormulario.js
        │   │   │   └── MenuSemanaGrid.js
        │   │   ├── hooks/
        │   │   │   └── useMenu.js
        │   │   │   └── useMenuExport.js
        │   │   │   └── useMenuForm.js
        │   │   └── utils/
        │   │       └── menuHelpers.js
        │   │   └── MenuView.js
        │   ├── Pedidos/
        │   │   ├── components/
        │   │   │   └── PedidoCard.js
        │   │   │   └── PedidosEstadisticas.js
        │   │   │   └── PedidosFiltros.js
        │   │   ├── hooks/
        │   │   │   └── usePedidos.js
        │   │   │   └── useSocketPedidos.js
        │   │   └── utils/
        │   │       └── pedidosHelpers.js
        │   │   └── PedidoModal.js
        │   │   └── PedidosList.js
        │   ├── Platos/
        │   │   └── PlatoModal.js
        │   │   └── PlatosList.js
        │   ├── Reportes/
        │   │   └── ReportesView.js
        │   ├── Roles/
        │   │   └── RolModal.js
        │   │   └── RolesList.js
        │   └── Usuarios/
        │       └── UsuarioModal.js
        │       └── UsuariosList.js
        └── services/
            └── apiAuth.js
            └── apiCierreTurno.js
            └── apiCliente.js
            └── apiCreditos.js
            └── apiMenu.js
            └── apiPedidos.js
            └── apiPlatos.js
            └── apiRoles.js
            └── apiUsuarios.js
```

---

## 🔌 API REST

| Ruta | Endpoints |
|------|----------|
| `/api/auth` | POST /login, POST /logout, GET /me |
| `/api/cierresTurno` | GET, POST, GET /:id |
| `/api/clientes` | GET, POST, PUT /:id, DELETE /:id |
| `/api/creditos` | GET /clientes, POST /:clienteId/pagar |
| `/api/menuDia` | GET /rango, POST, PUT /:id, DELETE /:id, PATCH /:id/toggle |
| `/api/pedidos` | GET, POST, PUT /:id, DELETE /:id, PATCH /:id/estado |
| `/api/platos` | GET, POST, PUT /:id, DELETE /:id, PATCH /:id/toggle |
| `/api/roles` | GET, POST, PUT /:id, DELETE /:id |
| `/api/usuarios` | GET, POST, PUT /:id, DELETE /:id |


---

## ⚙️ Variables de Entorno

### Backend (`.env`)
```env
MONGODB_URI=mongodb+srv://...
PORT=5000
FRONTEND_URL=https://tu-frontend.onrender.com
JWT_SECRET=tu_secreto_aqui
```

### Frontend (`.env`)
```env
REACT_APP_API_URL=https://tu-backend.onrender.com
REACT_APP_SOCKET_URL=https://tu-backend.onrender.com
```

---

## 🌐 Deploy en Render

### Backend (Web Service)
| Campo | Valor |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

### Frontend (Static Site)
| Campo | Valor |
|-------|-------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `frontend/build` |

---

## 🔄 Tiempo Real - Socket.IO

| Evento | Descripción |
|--------|-------------|
| `pedido:nuevo` | Nuevo pedido creado |
| `pedido:actualizado` | Estado de pedido cambiado |
| `pedido:eliminado` | Pedido eliminado |
| `credito:actualizado` | Pago de crédito registrado |

---

## 📦 Dependencias principales

### Backend
- `cors` ^2.8.5
- `dotenv` ^16.0.3
- `express` ^4.18.2
- `mongoose` ^7.0.0
- `socket.io` ^4.6.0

### Frontend
- `@testing-library/dom` ^10.4.1
- `@testing-library/jest-dom` ^6.9.1
- `@testing-library/react` ^16.3.2
- `@testing-library/user-event` ^13.5.0
- `jspdf` ^4.1.0
- `jspdf-autotable` ^5.0.7
- `lucide-react` ^0.563.0
- `react` ^19.2.4
- `react-dom` ^19.2.4
- `react-scripts` 5.0.1
- `recharts` ^3.7.0
- `socket.io-client` ^4.8.3
- `web-vitals` ^2.1.4
- `xlsx` ^0.18.5

---

## 📱 Contacto

📞 **+51 931 870 297**
